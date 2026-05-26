const express = require("express");
const router  = express.Router();
const {
  getDashboardSummary, getWeeklySales, getTopSellingProducts,
  getIncomingOrders, getMyProducts,
} = require("../controllers/seller.controller");
const { verifyToken, checkRole } = require("../middleware/auth.middleware");


router.use(verifyToken, checkRole(["seller"]));

router.get("/dashboard",       getDashboardSummary);
router.get("/earnings/weekly", getWeeklySales);
router.get("/products",        getMyProducts);
router.get("/products/top",    getTopSellingProducts);
router.get("/orders/incoming", getIncomingOrders);

module.exports = router;
