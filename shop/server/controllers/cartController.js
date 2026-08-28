const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { sendSuccess, sendError } = require("../utils/response");

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

// If a product referenced in the cart was deleted (e.g. by an admin),
// populate() leaves that item's .product as null. Silently drop those
// items rather than crashing or showing a broken row.
async function pruneDeletedProducts(cart) {
  const before = cart.items.length;
  cart.items = cart.items.filter((item) => item.product !== null);
  if (cart.items.length !== before) {
    await cart.save();
  }
  return cart;
}

async function getCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await cart.populate("items.product");
    await pruneDeletedProducts(cart);
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
    if (quantity > product.stock) {
      return sendError(res, 400, `Only ${product.stock} in stock`);
    }

    const cart = await getOrCreateCart(req.user._id);
    const existingItem = cart.items.find((item) => item.product.toString() === productId);

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

    await cart.populate("items.product");
    if (item.product && quantity > item.product.stock) {
      return sendError(res, 400, `Only ${item.product.stock} in stock`);
    }

    item.quantity = quantity;
    await cart.save();
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
