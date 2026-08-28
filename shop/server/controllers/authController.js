const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const RESET_TOKEN_EXPIRES_MS = 30 * 60 * 1000; // 30 minutes

function signToken(user) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return sendError(res, 400, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // role is never read from req.body — cannot self-assign admin.
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user);
    sendSuccess(res, 201, { user, token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+passwordHash",
    );
    if (!user) {
      return sendError(res, 401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 401, "Invalid email or password");
    }

    const token = signToken(user);
    sendSuccess(res, 200, { user, token });
  } catch (err) {
    next(err);
  }
}

function me(req, res) {
  sendSuccess(res, 200, { user: req.user });
}

// Dev-mode reset flow: no email service configured, so the token is
// returned directly in the response (and logged) instead of emailed.
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    // Same response whether or not the email exists, so this endpoint
    // can't be used to check which emails are registered.
    if (!user) {
      return sendSuccess(res, 200, {
        message:
          "If that email is registered, a reset token has been generated.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRES_MS);
    await user.save();

    console.log(`[DEV] Password reset token for ${email}: ${rawToken}`);

    sendSuccess(res, 200, {
      message: "If that email is registered, a reset token has been generated.",
      devResetToken: rawToken, // dev-only — remove if a real email service is added later
    });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return sendError(res, 400, "Reset token is invalid or has expired");
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendSuccess(res, 200, {
      message: "Password has been reset. You can now log in.",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, forgotPassword, resetPassword };
