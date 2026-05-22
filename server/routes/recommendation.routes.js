const express = require("express");
const router  = express.Router();
const { getPersonalised, getSimilar } = require("../controllers/recommendation.controller");
const { optionalVerifyToken } = require("../middleware/auth.middleware");

// Personalised supports optional auth (handles both guest fallbacks & logged-in users)
router.get("/", optionalVerifyToken, getPersonalised);

// Similar products is public (no history needed)
router.get("/similar/:productId", getSimilar);

module.exports = router;
