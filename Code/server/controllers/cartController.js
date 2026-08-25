const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { sendSuccess, sendError } = require("../utils/response");

// Every user has one cart only
//  so the front-end doesnt have to handle special cases GET /api/cart always returns something.
async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

async function getCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await cart.populate("items.product");
    sendSuccess(res, 200, cart);
  } catch (err) {
    next(err);
  }
}

async function addItem(req, res, next) {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 404, "Product not found");
    }

    const cart = await getOrCreateCart(req.user._id);

    // ensure quantity is increased if object already exist in cart
    //instead of duplicate line
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate("items.product");
    sendSuccess(res, 200, cart);
  } catch (err) {
    next(err);
  }
}

async function updateItemQuantity(req, res, next) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((i) => i.product.toString() === productId);

    if (!item) {
      return sendError(res, 404, "That product is not in your cart");
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product");
    sendSuccess(res, 200, cart);
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const { productId } = req.params;

    const cart = await getOrCreateCart(req.user._id);
    const beforeCount = cart.items.length;

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);

    if (cart.items.length === beforeCount) {
      return sendError(res, 404, "That product is not in your cart");
    }

    await cart.save();
    await cart.populate("items.product");
    sendSuccess(res, 200, cart);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addItem, updateItemQuantity, removeItem };
