const express = require("express");
const router  = express.Router();
const {
  getPlatformAnalytics, getPendingVendors, approveVendor, rejectVendor,
  getAllUsers, toggleUserActive, createCategory, getAllCategories,
  updateCategory, deleteCategory, getAllOrders, updateCommissionSettings,
  updateTimerSettings, adminRefund,
} = require("../controllers/admin.controller");
const { verifyToken, checkRole } = require("../middleware/auth.middleware");


router.use(verifyToken, checkRole(["admin"]));


router.get("/analytics",                  getPlatformAnalytics);


router.get("/vendors/pending",            getPendingVendors);
router.patch("/vendors/:id/approve",      approveVendor);
router.patch("/vendors/:id/reject",       rejectVendor);


router.get("/users",                      getAllUsers);
router.patch("/users/:id/toggle-active",  toggleUserActive);


router.get("/categories",                 getAllCategories);
router.post("/categories",                createCategory);
router.put("/categories/:id",             updateCategory);
router.delete("/categories/:id",          deleteCategory);


router.get("/orders",                     getAllOrders);
router.post("/orders/:id/refund",         adminRefund);


router.patch("/settings/commission",      updateCommissionSettings);
router.patch("/settings/timer",           updateTimerSettings);

module.exports = router;
