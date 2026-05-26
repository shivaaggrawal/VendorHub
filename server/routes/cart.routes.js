const express = require("express");
const router  = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } =
  require("../controllers/cart.controller");
const { verifyToken, checkRole } = require("../middleware/auth.middleware");


router.use(verifyToken, checkRole(["buyer"]));

router.get("/",              getCart);
router.post("/",             addToCart);
router.put("/:itemId",       updateCartItem);
router.delete("/clear",      clearCart);
router.delete("/:itemId",    removeFromCart);

module.exports = router;
