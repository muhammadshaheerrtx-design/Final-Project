const express = require("express");
const router = express.Router();

const { checkout, getAllOrders, getOrderById } = require("../controllers/ordersController");
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);

router.post("/", checkout);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);

module.exports = router;
