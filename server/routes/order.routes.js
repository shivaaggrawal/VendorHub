const express = require("express");
const router  = express.Router();
const {
  placeOrder, getMyOrders, getOrderById, updateOrderStatus, cancelOrder,
} = require("../controllers/order.controller");
const { verifyToken, checkRole } = require("../middleware/auth.middleware");
const { placeOrderValidator }    = require("../validators/order.validator");

router.use(verifyToken);


router.post("/",               checkRole(["buyer"]),          placeOrderValidator, placeOrder);
router.get("/",                checkRole(["buyer"]),          getMyOrders);
router.get("/:id",             getOrderById);
router.patch("/:id/status",    checkRole(["seller", "admin"]), updateOrderStatus);
router.post("/:id/cancel",     cancelOrder);

module.exports = router;
