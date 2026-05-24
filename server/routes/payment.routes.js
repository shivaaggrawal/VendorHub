const express = require("express");
const router  = express.Router();
const { createOrder, verifyPayment, refund, getPayouts } =
  require("../controllers/payment.controller");
const { verifyToken, checkRole } = require("../middleware/auth.middleware");

router.use(verifyToken);

// Buyer: initiate and verify payment
router.post("/create-order",  checkRole(["buyer"]),          createOrder);
router.post("/verify",        checkRole(["buyer"]),          verifyPayment);

// Seller: payout history
router.get("/payouts",        checkRole(["seller"]),         getPayouts);

// Admin: process refund
router.post("/:orderId/refund", checkRole(["admin"]),        refund);

module.exports = router;
