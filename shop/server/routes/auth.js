const express = require("express");
const router = express.Router();

const { register, login, me, forgotPassword, resetPassword } = require("../controllers/authController");
const {
  validateRegisterBody,
  validateLoginBody,
  validateForgotPasswordBody,
  validateResetPasswordBody,
} = require("../middleware/validateAuth");
const requireAuth = require("../middleware/requireAuth");

router.post("/register", validateRegisterBody, register);
router.post("/login", validateLoginBody, login);
router.get("/me", requireAuth, me);
router.post("/forgot-password", validateForgotPasswordBody, forgotPassword);
router.post("/reset-password", validateResetPasswordBody, resetPassword);

module.exports = router;
