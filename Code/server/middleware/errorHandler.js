const { sendError } = require("../utils/response");

function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, err.name, "-", err.message);

  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 400, "Validation failed", details);
  }

  if (err.name === "CastError") {
    return sendError(res, 400, `Invalid ${err.path}: ${err.value}`);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return sendError(res, 400, `${field} already in use`);
  }

  const statusCode = err.statusCode || 500;
  sendError(res, statusCode, err.message || "Internal server error");
}

module.exports = errorHandler;
