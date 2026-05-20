const express = require("express");
const router = express.Router();
const c = require("../controllers/admin.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

// All admin routes require authentication + ADMIN role
router.use(authenticate, requireRole("ADMIN"));

router.get("/users", c.getUsers);
router.get("/users/:id", c.getUserById);
router.get("/employers/pending", c.getPendingEmployers);
router.put("/employers/:id/approve", c.approveEmployer);
router.put("/employers/:id/reject", c.rejectEmployer);
router.put("/users/:id/deactivate", c.deactivateUser);
router.put("/users/:id/reactivate", c.reactivateUser);
router.get("/analytics", c.getAnalytics);
router.get("/audit-logs", c.getAuditLogs);

module.exports = router;
