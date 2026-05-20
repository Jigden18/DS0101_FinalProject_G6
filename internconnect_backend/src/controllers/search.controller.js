const prisma = require("../utils/prisma");
const { paginate } = require("../utils/pagination");
const { asyncHandler } = require("../middleware/error.middleware");

const searchListings = asyncHandler(async (req, res) => {
  const {
    q,
    filters = {},
    sort = "postedDate",
    order = "desc",
    page = 1,
    limit = 20,
  } = req.body;
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const p = Math.max(1, parseInt(page) || 1);
  const skip = (p - 1) * l;

  const where = {
    status: "ACTIVE",
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(filters.location?.length && { location: { in: filters.location } }),
    ...(filters.jobField?.length && { jobField: { in: filters.jobField } }),
    ...(filters.workHours?.length && { workHours: { in: filters.workHours } }),
    ...(filters.deadline_after && {
      deadline: { gte: new Date(filters.deadline_after) },
    }),
  };

  const safeSort = ["postedDate", "deadline", "viewCount"].includes(sort)
    ? sort
    : "postedDate";
  const safeOrder = order === "asc" ? "asc" : "desc";

  const [results, total] = await prisma.$transaction([
    prisma.listing.findMany({
      where,
      take: l,
      skip,
      orderBy: { [safeSort]: safeOrder },
      include: { employer: { select: { companyName: true, logoUrl: true } } },
    }),
    prisma.listing.count({ where }),
  ]);

  res.json({
    status: 200,
    data: {
      results,
      total,
      page: p,
      limit: l,
      pagination: paginate(p, l, total),
    },
  });
});

const getSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return res.status(400).json({
      status: 400,
      error: {
        code: "VALIDATION_ERROR",
        message: "Query parameter q is required",
      },
    });
  }

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      title: { contains: q.trim(), mode: "insensitive" },
    },
    select: { title: true },
    take: 5,
  });

  // Deduplicate
  const suggestions = [...new Set(listings.map((l) => l.title))];
  res.json({ status: 200, data: { suggestions } });
});

module.exports = { searchListings, getSuggestions };
