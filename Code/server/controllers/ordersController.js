const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const { sendSuccess, sendError } = require("../utils/response");

// POST /api/orders — checkout. This is the one non-trivial piece of
// business logic in the whole backend: it reads the user's cart,
// converts it into a permanent Order record, optionally applies a
// coupon, and clears the cart. Everything else in this API is closer to
// plain CRUD; this is the closest thing to a "transaction."
async function checkout(req, res, next) {
  try {
    const { couponCode } = req.body || {};

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return sendError(res, 400, "Your cart is empty");
    }

    // Build order items with a SNAPSHOT of each product's current name
    // and price. This is the key design decision from the Day 31 data
    // model: once this order is saved, it no longer cares if the
    // product's price changes later — the order permanently remembers
    // what was actually paid.
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      priceAtPurchase: item.product.price,
      quantity: item.quantity,
    }));

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0
    );

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

    // Clear the cart only AFTER the order was successfully created —
    // if Order.create() had thrown, the cart is still intact and
    // nothing was lost.
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
