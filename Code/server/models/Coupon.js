const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountPercent: {
      type: Number,
      required: [true, "discountPercent is required"],
      min: [1, "discountPercent must be between 1 and 100"],
      max: [100, "discountPercent must be between 1 and 100"],
    },
    expiresAt: {
      type: Date,
      required: [true, "expiresAt is required"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
