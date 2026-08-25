const express = require("express");
const router = express.Router();

const { register, login, me } = require("../controllers/authController");
const { validateRegisterBody, validateLoginBody } = require("../middleware/validateAuth");
const requireAuth = require("../middleware/requireAuth");

router.post("/register", validateRegisterBody, register);
router.post("/login", validateLoginBody, login);
router.get("/me", requireAuth, me);

module.exports = router;
