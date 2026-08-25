const { sendError } = require("../utils/response");

function validateProductBody(req, res, next) {
  const { name, description, price, category, stock } = req.body || {};
  const errors = [];

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("name is required and must be a non-empty string");
  }
  if (!description || typeof description !== "string" || !description.trim()) {
    errors.push("description is required and must be a non-empty string");
  }
  if (price === undefined || typeof price !== "number" || price < 0) {
    errors.push("price is required and must be a positive number");
  }
  if (!category || typeof category !== "string" || !category.trim()) {
    errors.push("category is required and must be a non-empty string");
  }
  if (stock !== undefined && (typeof stock !== "number" || stock < 0)) {
    errors.push("stock must be a non-negative number");
  }

  if (errors.length > 0) return sendError(res, 400, "Validation failed", errors);
  next();
}

function validateProductPatchBody(req, res, next) {
  const body = req.body || {};
  const errors = [];

  if (Object.keys(body).length === 0) {
    return sendError(res, 400, "Request body cannot be empty");
  }
  if ("price" in body && (typeof body.price !== "number" || body.price < 0)) {
    errors.push("price must be a positive number");
  }
  if ("stock" in body && (typeof body.stock !== "number" || body.stock < 0)) {
    errors.push("stock must be a non-negative number");
  }

  if (errors.length > 0) return sendError(res, 400, "Validation failed", errors);
  next();
}

module.exports = { validateProductBody, validateProductPatchBody };
