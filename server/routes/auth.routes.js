const express = require("express");
const router  = express.Router();
const { register, login, logout, getMe, updateMe, toggleWishlist } = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authLimiter }  = require("../middleware/rateLimiter.middleware");
const { registerValidator, loginValidator } = require("../validators/auth.validator");


router.post("/register", authLimiter, registerValidator, register);
router.post("/login",    authLimiter, loginValidator,    login);
router.post("/logout",   logout);


router.get("/me",    verifyToken, getMe);
router.patch("/me",  verifyToken, updateMe);
router.post("/wishlist/:productId", verifyToken, toggleWishlist);

module.exports = router;
