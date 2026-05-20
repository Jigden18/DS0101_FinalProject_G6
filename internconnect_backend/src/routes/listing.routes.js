const express = require("express");
const router = express.Router();
const c = require("../controllers/listing.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

router.get("/", c.getListings);
router.get("/my", authenticate, requireRole("EMPLOYER"), c.getMyListings);
router.get("/:id", c.getListing);
router.get("/:id/related", c.getRelatedListings);
router.get(
  "/:id/applicants",
  authenticate,
  requireRole("EMPLOYER", "ADMIN"),
  c.getApplicants,
);

router.post("/", authenticate, requireRole("EMPLOYER"), c.createListing);
router.put("/:id", authenticate, requireRole("EMPLOYER"), c.updateListing);
router.put("/:id/close", authenticate, requireRole("EMPLOYER"), c.closeListing);
router.delete(
  "/:id",
  authenticate,
  requireRole("EMPLOYER", "ADMIN"),
  c.deleteListing,
);

module.exports = router;
