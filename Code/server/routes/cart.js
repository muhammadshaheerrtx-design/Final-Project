const express = require("express");
const router = express.Router();

const { getCart, addItem, updateItemQuantity, removeItem } = require("../controllers/cartController");
const { validateCartItemBody, validateQuantityBody } = require("../middleware/validateCart");
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);

router.get("/", getCart);
router.post("/items", validateCartItemBody, addItem);
router.patch("/items/:productId", validateQuantityBody, updateItemQuantity);
router.delete("/items/:productId", removeItem);

module.exports = router;
