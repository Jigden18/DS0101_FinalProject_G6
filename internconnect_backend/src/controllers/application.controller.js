const prisma = require("../utils/prisma");
const { paginate } = require("../utils/pagination");
const { asyncHandler } = require("../middleware/error.middleware");

const checkApplication = asyncHandler(async (req, res) => {
  const { listing_id } = req.query;
  if (!listing_id) {
    return res.status(400).json({
      status: 400,
      error: {
        code: "VALIDATION_ERROR",
        message: "listing_id query parameter is required",
      },
    });
  }

  const application = await prisma.application.findFirst({
    where: { studentId: req.user.sub, listingId: listing_id },
    select: { id: true, status: true, appliedDate: true },
  });

  res.json({
    status: 200,
    data: {
      has_applied: !!application,
      application: application || null,
    },
  });
});

const submitApplication = asyncHandler(async (req, res) => {
  // Accept both snake_case and camelCase from frontend
  const listing_id   = req.body.listing_id   || req.body.listingId;
  const cover_letter = req.body.cover_letter  || req.body.coverLetter;

  if (!req.file || !req.fileUrl) {
    return res.status(400).json({
      status: 400,
      error: { code: "VALIDATION_ERROR", message: "Resume file is required" },
    });
  }

  if (!listing_id) {
    return res.status(400).json({
      status: 400,
      error: { code: "VALIDATION_ERROR", message: "listing_id is required" },
    });
  }

  if (!cover_letter || cover_letter.trim().length === 0) {
    return res.status(400).json({
      status: 400,
      error: { code: "VALIDATION_ERROR", message: "cover_letter is required" },
    });
  }

  const listing = await prisma.listing.findFirst({
    where: { id: listing_id, status: "ACTIVE" },
  });
  if (!listing) {
    return res.status(404).json({
      status: 404,
      error: {
        code: "NOT_FOUND",
        message: "Listing not found or no longer active",
      },
    });
  }

  try {
    const application = await prisma.application.create({
      data: {
        studentId: req.user.sub,
        listingId: listing_id,
        coverLetter: cover_letter,
        resumeUrl: req.fileUrl,
        resumeFilename: req.file.originalname,
      },
      select: {
        id: true,
        studentId: true,
        listingId: true,
        status: true,
        appliedDate: true,
      },
    });

    res.status(201).json({
      status: 201,
      data: { ...application, message: "Application submitted successfully" },
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({
        status: 409,
        error: {
          code: "DUPLICATE_ENTRY",
          message: "You have already applied to this listing",
        },
      });
    }
    throw err;
  }
});

const getApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const p = Math.max(1, parseInt(page) || 1);
  const skip = (p - 1) * l;

  let where = {};
  if (req.user.role === "STUDENT") {
    where = { studentId: req.user.sub };
  } else if (req.user.role === "EMPLOYER") {
    where = { listing: { employerId: req.user.sub } };
  }
  if (status) where.status = status;

  const [applications, total] = await prisma.$transaction([
    prisma.application.findMany({
      where,
      take: l,
      skip,
      orderBy: { appliedDate: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            jobField: true,
            employer: { select: { companyName: true } },
          },
        },
        student: {
          select: {
            fullName: true,
            avatarUrl: true,
            user: { select: { email: true } },
          },
        },
      },
    }),
    prisma.application.count({ where }),
  ]);

  res.json({
    status: 200,
    data: { applications, pagination: paginate(p, l, total) },
  });
});

const getApplication = asyncHandler(async (req, res) => {
  const application = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: {
      student: { include: { user: { select: { email: true } } } },
      listing: {
        include: { employer: { select: { id: true, companyName: true } } },
      },
    },
  });

  if (!application)
    return res.status(404).json({
      status: 404,
      error: { code: "NOT_FOUND", message: "Application not found" },
    });

  const isStudent =
    req.user.role === "STUDENT" && application.studentId === req.user.sub;
  const isEmployer =
    req.user.role === "EMPLOYER" &&
    application.listing.employer.id === req.user.sub;
  const isAdmin = req.user.role === "ADMIN";

  if (!isStudent && !isEmployer && !isAdmin) {
    return res.status(403).json({
      status: 403,
      error: { code: "FORBIDDEN", message: "Forbidden" },
    });
  }

  res.json({ status: 200, data: application });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status, review_notes } = req.body;

  const application = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: { listing: { select: { employerId: true } } },
  });

  if (!application)
    return res.status(404).json({
      status: 404,
      error: { code: "NOT_FOUND", message: "Application not found" },
    });

  if (
    req.user.role === "EMPLOYER" &&
    application.listing.employerId !== req.user.sub
  ) {
    return res.status(403).json({
      status: 403,
      error: {
        code: "FORBIDDEN",
        message: "You can only update applications on your own listings",
      },
    });
  }

  const updated = await prisma.application.update({
    where: { id: req.params.id },
    data: {
      status,
      reviewNotes: review_notes || null,
      reviewedDate: new Date(),
    },
    select: { id: true, status: true, reviewedDate: true },
  });

  res.json({
    status: 200,
    data: { ...updated, message: "Application status updated" },
  });
});

const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await prisma.application.findUnique({
    where: { id: req.params.id },
    select: { studentId: true, status: true },
  });

  if (!application)
    return res.status(404).json({
      status: 404,
      error: { code: "NOT_FOUND", message: "Application not found" },
    });

  if (application.studentId !== req.user.sub) {
    return res.status(403).json({
      status: 403,
      error: {
        code: "FORBIDDEN",
        message: "You can only withdraw your own applications",
      },
    });
  }

  if (application.status !== "SUBMITTED") {
    return res.status(400).json({
      status: 400,
      error: {
        code: "INVALID_ACTION",
        message: "Only applications with SUBMITTED status can be withdrawn",
      },
    });
  }

  await prisma.application.delete({ where: { id: req.params.id } });
  res.json({
    status: 200,
    data: { message: "Application withdrawn successfully" },
  });
});

module.exports = {
  checkApplication,
  submitApplication,
  getApplications,
  getApplication,
  updateStatus,
  withdrawApplication,
};