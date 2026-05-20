const express = require("express");
const router = express.Router();

// These are the valid values the frontend should use for dropdowns and filters.
// Keeping them here means the frontend never has to hardcode them.
router.get("/", (req, res) => {
  res.json({
    status: 200,
    data: {
      job_fields: [
        "Technology",
        "Data Science",
        "Design",
        "Marketing",
        "Finance",
        "Engineering",
        "Healthcare",
        "Education",
        "Legal",
        "Operations",
        "Sales",
        "Other",
      ],
      work_hours: ["Full-time", "Part-time", "Contract", "Internship"],
      industries: [
        "Technology",
        "Data & Analytics",
        "Finance & Banking",
        "Healthcare",
        "Education",
        "E-commerce",
        "Media & Entertainment",
        "Manufacturing",
        "Government",
        "Non-profit",
        "Other",
      ],
      company_sizes: [
        "1-10",
        "11-50",
        "50-200",
        "200-500",
        "500-1000",
        "1000+",
      ],
      application_statuses: [
        "SUBMITTED",
        "UNDER_REVIEW",
        "ACCEPTED",
        "REJECTED",
      ],
      listing_statuses: ["ACTIVE", "CLOSED", "PENDING"],
    },
  });
});

module.exports = router;
