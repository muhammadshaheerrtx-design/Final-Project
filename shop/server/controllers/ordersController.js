const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const { sendSuccess, sendError } = require("../utils/response");

async function checkout(req, res, next) {
  try {
    const { couponCode } = req.body || {};

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return sendError(res, 400, "Your cart is empty");
    }

    // A product referenced in the cart may have been deleted since it
    // was added — populate() leaves .product as null in that case.
    const validItems = cart.items.filter((item) => item.product !== null);
    if (validItems.length === 0) {
      return sendError(res, 400, "The items in your cart are no longer available");
    }

    // Stock can also have changed since the item was added — verify
    // before committing to an order rather than trusting the cart blindly.
    const outOfStock = validItems.find((item) => item.quantity > item.product.stock);
    if (outOfStock) {
      return sendError(
        res,
        400,
        `${outOfStock.product.name} only has ${outOfStock.product.stock} in stock`
      );
    }

    // Snapshot name/price at purchase time — an order must never drift
    // if the product's price changes later.
    const orderItems = validItems.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      priceAtPurchase: item.product.price,
      quantity: item.quantity,
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);

    let discountAmount = 0;
    let appliedCouponCode = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

      if (!coupon || !coupon.active || coupon.expiresAt < new Date()) {
        return sendError(res, 400, "Invalid or expired coupon code");
      }

      discountAmount = Math.round(subtotal * (coupon.discountPercent / 100) * 100) / 100;
      appliedCouponCode = coupon.code;
    }

    const total = subtotal - discountAmount;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      couponCode: appliedCouponCode,
      discountAmount,
      subtotal,
      total,
      status: "placed",
    });

    await Promise.all(
      validItems.map((item) =>
        mongoose.model("Product").updateOne({ _id: item.product._id }, { $inc: { stock: -item.quantity } })
      )
    );

    cart.items = [];
    await cart.save();

    sendSuccess(res, 201, order);
  } catch (err) {
    next(err);
  }
}

async function getAllOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    sendSuccess(res, 200, orders, { count: orders.length });
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid order id");
    }

    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) {
      return sendError(res, 404, `Order ${id} not found`);
    }

    sendSuccess(res, 200, order);
  } catch (err) {
    next(err);
  }
}

module.exports = { checkout, getAllOrders, getOrderById };
