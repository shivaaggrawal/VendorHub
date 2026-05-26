const express = require("express");
const router  = express.Router();
const { createOrder, verifyPayment, refund, getPayouts } =
  require("../controllers/payment.controller");
const { verifyToken, checkRole } = require("../middleware/auth.middleware");

router.use(verifyToken);


router.post("/create-order",  checkRole(["buyer"]),          createOrder);
router.post("/verify",        checkRole(["buyer"]),          verifyPayment);


router.get("/payouts",        checkRole(["seller"]),         getPayouts);


router.post("/:orderId/refund", checkRole(["admin"]),        refund);

module.exports = router;
