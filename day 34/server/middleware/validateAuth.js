const { sendError } = require("../utils/response");

function validateRegisterBody(req, res, next) {
  const { name, email, password } = req.body || {};
  const errors = [];

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("name is required and must be a non-empty string");
  }
  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("a valid email is required");
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    errors.push("password is required and must be at least 6 characters");
  }

  if (errors.length > 0) return sendError(res, 400, "Validation failed", errors);
  next();
}

function validateLoginBody(req, res, next) {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email) errors.push("email is required");
  if (!password) errors.push("password is required");

  if (errors.length > 0) return sendError(res, 400, "Validation failed", errors);
  next();
}

function validateForgotPasswordBody(req, res, next) {
  const { email } = req.body || {};
  if (!email || typeof email !== "string") {
    return sendError(res, 400, "Validation failed", ["email is required"]);
  }
  next();
}

function validateResetPasswordBody(req, res, next) {
  const { token, newPassword } = req.body || {};
  const errors = [];

  if (!token || typeof token !== "string") errors.push("token is required");
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    errors.push("newPassword is required and must be at least 6 characters");
  }

  if (errors.length > 0) return sendError(res, 400, "Validation failed", errors);
  next();
}

module.exports = {
  validateRegisterBody,
  validateLoginBody,
  validateForgotPasswordBody,
  validateResetPasswordBody,
};
