const express = require("express");
const router  = express.Router();
const {
  getPlatformAnalytics, getPendingVendors, approveVendor, rejectVendor,
  getAllUsers, toggleUserActive, createCategory, getAllCategories,
  updateCategory, deleteCategory, getAllOrders, updateCommissionSettings,
  updateTimerSettings, adminRefund,
} = require("../controllers/admin.controller");
const { verifyToken, checkRole } = require("../middleware/auth.middleware");

// All admin routes require admin role
router.use(verifyToken, checkRole(["admin"]));

// Analytics
router.get("/analytics",                  getPlatformAnalytics);

// Vendor management
router.get("/vendors/pending",            getPendingVendors);
router.patch("/vendors/:id/approve",      approveVendor);
router.patch("/vendors/:id/reject",       rejectVendor);

// User management
router.get("/users",                      getAllUsers);
router.patch("/users/:id/toggle-active",  toggleUserActive);

// Category management
router.get("/categories",                 getAllCategories);
router.post("/categories",                createCategory);
router.put("/categories/:id",             updateCategory);
router.delete("/categories/:id",          deleteCategory);

// Order management
router.get("/orders",                     getAllOrders);
router.post("/orders/:id/refund",         adminRefund);

// Platform settings
router.patch("/settings/commission",      updateCommissionSettings);
router.patch("/settings/timer",           updateTimerSettings);

module.exports = router;
