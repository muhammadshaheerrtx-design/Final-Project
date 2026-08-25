const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct,
  replaceProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productsController");

const { validateProductBody, validateProductPatchBody } = require("../middleware/validateProduct");
const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

// Public — anyone can browse the catalog, no login required.
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Admin-only — requireAuth confirms identity, requireAdmin confirms role.
// Both run in order before the actual controller function.
router.post("/", requireAuth, requireAdmin, validateProductBody, createProduct);
router.put("/:id", requireAuth, requireAdmin, validateProductBody, replaceProduct);
router.patch("/:id", requireAuth, requireAdmin, validateProductPatchBody, updateProduct);
router.delete("/:id", requireAuth, requireAdmin, deleteProduct);

module.exports = router;
