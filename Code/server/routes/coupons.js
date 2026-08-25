const express = require("express");
const router = express.Router();

const { validateCoupon } = require("../controllers/couponController");
const requireAuth = require("../middleware/requireAuth");

router.post("/validate", requireAuth, validateCoupon);

module.exports = router;
