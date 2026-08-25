const mongoose = require("mongoose");
const { sendError } = require("../utils/response");

function validateCartItemBody(req, res, next) {
  const { productId, quantity } = req.body || {};
  const errors = [];

  if (!productId || !mongoose.isValidObjectId(productId)) {
    errors.push("a valid productId is required");
  }
  if (quantity === undefined || typeof quantity !== "number" || quantity < 1) {
    errors.push("quantity is required and must be at least 1");
  }

  if (errors.length > 0) return sendError(res, 400, "Validation failed", errors);
  next();
}

function validateQuantityBody(req, res, next) {
  const { quantity } = req.body || {};

  if (quantity === undefined || typeof quantity !== "number" || quantity < 1) {
    return sendError(res, 400, "Validation failed", ["quantity is required and must be at least 1"]);
  }
  next();
}

module.exports = { validateCartItemBody, validateQuantityBody };
