const prisma = require("../utils/prisma");
const { paginate } = require("../utils/pagination");
const { asyncHandler } = require("../middleware/error.middleware");

const getMyListings = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    sort = "postedDate",
    order = "desc",
  } = req.query;
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const p = Math.max(1, parseInt(page) || 1);
  const skip = (p - 1) * l;

  const where = {
    employerId: req.user.sub,
    ...(status && { status }),
  };

  const safeSort = ["postedDate", "deadline", "viewCount"].includes(sort)
    ? sort
    : "postedDate";
  const safeOrder = order === "asc" ? "asc" : "desc";

  const [listings, total] = await prisma.$transaction([
    prisma.listing.findMany({
      where,
      take: l,
      skip,
      orderBy: { [safeSort]: safeOrder },
      include: {
        _count: { select: { applications: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  res.json({
    status: 200,
    data: { listings, pagination: paginate(p, l, total) },
  });
});

const getListings = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    location,
    jobField,
    workHours,
    search,
    sort = "postedDate",
    order = "desc",
  } = req.query;
  const {
    limit: l,
    skip,
    page: p,
  } = (() => {
    const lim = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const pg = Math.max(1, parseInt(page) || 1);
    return { limit: lim, skip: (pg - 1) * lim, page: pg };
  })();

  const where = {
    status: "ACTIVE",
    ...(location && { location: { contains: location, mode: "insensitive" } }),
    ...(jobField && { jobField }),
    ...(workHours && { workHours }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const safeSort = ["postedDate", "deadline"].includes(sort)
    ? sort
    : "postedDate";
  const safeOrder = order === "asc" ? "asc" : "desc";

  const [listings, total] = await prisma.$transaction([
    prisma.listing.findMany({
      where,
      take: l,
      skip,
      orderBy: { [safeSort]: safeOrder },
      include: {
        employer: {
          select: { companyName: true, logoUrl: true, location: true },
        },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  res.json({
    status: 200,
    data: { listings, pagination: paginate(p, l, total) },
  });
});

const getListing = asyncHandler(async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
    include: {
      employer: {
        select: {
          companyName: true,
          contactPerson: true,
          industry: true,
          location: true,
          websiteUrl: true,
          companyBio: true,
          logoUrl: true,
        },
      },
      _count: { select: { applications: true } },
    },
  });
  if (!listing)
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "Listing not found" },
      });

  // Increment view count (fire and forget)
  prisma.listing
    .update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  res.json({ status: 200, data: listing });
});

const createListing = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    job_field,
    location,
    work_hours,
    stipend,
    requirements,
    deadline,
  } = req.body;
  const deadlineDate = new Date(deadline);
  if (deadlineDate <= new Date()) {
    return res
      .status(400)
      .json({
        status: 400,
        error: {
          code: "VALIDATION_ERROR",
          message: "Deadline must be a future date",
        },
      });
  }

  const listing = await prisma.listing.create({
    data: {
      employerId: req.user.sub,
      title,
      description,
      jobField: job_field,
      location,
      workHours: work_hours,
      stipend,
      requirements: requirements || [],
      deadline: deadlineDate,
    },
  });

  res.status(201).json({ status: 201, data: listing });
});

const updateListing = asyncHandler(async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
  });
  if (!listing)
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "Listing not found" },
      });
  if (listing.employerId !== req.user.sub) {
    return res
      .status(403)
      .json({
        status: 403,
        error: {
          code: "FORBIDDEN",
          message: "You can only edit your own listings",
        },
      });
  }

  const {
    title,
    description,
    job_field,
    location,
    work_hours,
    stipend,
    requirements,
    deadline,
  } = req.body;
  await prisma.listing.update({
    where: { id: req.params.id },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(job_field && { jobField: job_field }),
      ...(location && { location }),
      ...(work_hours && { workHours: work_hours }),
      ...(stipend && { stipend }),
      ...(requirements && { requirements }),
      ...(deadline && { deadline: new Date(deadline) }),
    },
  });

  res.json({
    status: 200,
    data: { id: req.params.id, message: "Listing updated successfully" },
  });
});

const closeListing = asyncHandler(async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
  });
  if (!listing)
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "Listing not found" },
      });
  if (listing.employerId !== req.user.sub) {
    return res
      .status(403)
      .json({
        status: 403,
        error: {
          code: "FORBIDDEN",
          message: "You can only close your own listings",
        },
      });
  }

  const updated = await prisma.listing.update({
    where: { id: req.params.id },
    data: { status: "CLOSED", closedDate: new Date() },
    select: { id: true, status: true, closedDate: true },
  });

  res.json({
    status: 200,
    data: { ...updated, message: "Listing closed successfully" },
  });
});

const deleteListing = asyncHandler(async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
  });
  if (!listing)
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "Listing not found" },
      });
  if (req.user.role !== "ADMIN" && listing.employerId !== req.user.sub) {
    return res
      .status(403)
      .json({
        status: 403,
        error: {
          code: "FORBIDDEN",
          message: "You can only delete your own listings",
        },
      });
  }

  await prisma.listing.delete({ where: { id: req.params.id } });
  res.json({ status: 200, data: { message: "Listing deleted successfully" } });
});

const getRelatedListings = asyncHandler(async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
    select: { jobField: true },
  });
  if (!listing)
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "Listing not found" },
      });

  const listings = await prisma.listing.findMany({
    where: {
      id: { not: req.params.id },
      status: "ACTIVE",
      jobField: listing.jobField,
    },
    take: 5,
    select: {
      id: true,
      title: true,
      location: true,
      stipend: true,
      jobField: true,
      employer: { select: { companyName: true } },
    },
  });

  res.json({ status: 200, data: { listings } });
});

const getApplicants = asyncHandler(async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
    select: { employerId: true },
  });
  if (!listing)
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "Listing not found" },
      });
  if (req.user.role !== "ADMIN" && listing.employerId !== req.user.sub) {
    return res
      .status(403)
      .json({
        status: 403,
        error: { code: "FORBIDDEN", message: "Forbidden" },
      });
  }

  const applicants = await prisma.application.findMany({
    where: { listingId: req.params.id },
    orderBy: { appliedDate: "desc" },
    include: {
      student: {
        select: {
          fullName: true,
          university: true,
          avatarUrl: true,
          user: { select: { email: true } },
        },
      },
    },
  });

  const summary = await prisma.application.groupBy({
    by: ["status"],
    where: { listingId: req.params.id },
    _count: { status: true },
  });

  const summaryMap = {
    total: applicants.length,
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    ACCEPTED: 0,
    REJECTED: 0,
  };
  summary.forEach((s) => {
    summaryMap[s.status] = s._count.status;
  });

  res.json({ status: 200, data: { applicants, summary: summaryMap } });
});

module.exports = {
  getMyListings,
  getListings,
  getListing,
  createListing,
  updateListing,
  closeListing,
  deleteListing,
  getRelatedListings,
  getApplicants,
};
