const Coupon = require("../models/Coupon");
const { sendSuccess, sendError } = require("../utils/response");

async function validateCoupon(req, res, next) {
  try {
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return sendError(res, 400, "code is required");
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return sendError(res, 404, "Coupon code not found");
    }
    if (!coupon.active) {
      return sendError(res, 400, "This coupon is no longer active");
    }
    if (coupon.expiresAt < new Date()) {
      return sendError(res, 400, "This coupon has expired");
    }

    sendSuccess(res, 200, {
      code: coupon.code,
      discountPercent: coupon.discountPercent,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { validateCoupon };
