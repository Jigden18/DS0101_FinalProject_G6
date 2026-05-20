const express = require("express");
const router = express.Router();
const {
  checkApplication,
  submitApplication,
  getApplications,
  getApplication,
  updateStatus,
  withdrawApplication,
} = require("../controllers/application.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { uploadResume } = require("../middleware/upload.middleware");

router.post(
  "/",
  authenticate,
  requireRole("STUDENT"),
  uploadResume,
  submitApplication,
);
router.get("/check", authenticate, requireRole("STUDENT"), checkApplication);
router.get("/", authenticate, getApplications);
router.get("/:id", authenticate, getApplication);
router.put(
  "/:id/status",
  authenticate,
  requireRole("EMPLOYER", "ADMIN"),
  updateStatus,
);
router.delete(
  "/:id",
  authenticate,
  requireRole("STUDENT"),
  withdrawApplication,
);

module.exports = router;
