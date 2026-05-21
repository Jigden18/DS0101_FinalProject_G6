const prisma = require("../utils/prisma");
const { paginate } = require("../utils/pagination");
const { asyncHandler } = require("../middleware/error.middleware");

const getUserById = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      student: true,
      employer: true,
      admin: { select: { fullName: true, permissions: true } },
    },
  });
  if (!user)
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "User not found" },
      });
  res.json({ status: 200, data: user });
});

const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, status } = req.query;
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const p = Math.max(1, parseInt(page) || 1);
  const skip = (p - 1) * l;

  const where = {
    ...(role && { role }),
    ...(status && { status }),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      take: l,
      skip,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        student: { select: { fullName: true, university: true, avatarUrl: true } },
        employer: { select: { companyName: true, industry: true, logoUrl: true } },
        admin: { select: { fullName: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const mapped = users.map((u) => ({
    ...u,
    name: u.student?.fullName || u.employer?.companyName || u.admin?.fullName,
    university: u.student?.university || "",
    industry: u.employer?.industry || "",
    avatar: u.student?.avatarUrl || u.employer?.logoUrl || "",
  }));

  res.json({
    status: 200,
    data: { users: mapped, pagination: paginate(p, l, total) },
  });
});

const getPendingEmployers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const p = Math.max(1, parseInt(page) || 1);
  const skip = (p - 1) * l;
  const where = { role: "EMPLOYER", status: "PENDING" };

  const [employers, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      take: l,
      skip,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
        employer: {
          select: {
            companyName: true,
            contactPerson: true,
            industry: true,
            location: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    status: 200,
    data: { pending_employers: employers, pagination: paginate(p, l, total) },
  });
});

const approveEmployer = asyncHandler(async (req, res) => {
  const user = await prisma.user.findFirst({
    where: { id: req.params.id, role: "EMPLOYER" },
  });
  if (!user)
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "Employer not found" },
      });

  await prisma.user.update({
    where: { id: req.params.id },
    data: { status: "ACTIVE" },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user.sub,
      action: "employer_approved",
      resourceType: "user",
      resourceId: req.params.id,
    },
  });

  res.json({
    status: 200,
    data: {
      id: req.params.id,
      status: "ACTIVE",
      message: "Employer approved successfully",
    },
  });
});

const rejectEmployer = asyncHandler(async (req, res) => {
  const { rejection_reason } = req.body;
  const user = await prisma.user.findFirst({
    where: { id: req.params.id, role: "EMPLOYER" },
  });
  if (!user)
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "Employer not found" },
      });

  await prisma.user.update({
    where: { id: req.params.id },
    data: { status: "INACTIVE" },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user.sub,
      action: "employer_rejected",
      resourceType: "user",
      resourceId: req.params.id,
      details: { rejection_reason },
    },
  });

  res.json({
    status: 200,
    data: {
      id: req.params.id,
      status: "INACTIVE",
      message: "Employer registration rejected",
    },
  });
});

const deactivateUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user)
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "User not found" },
      });

  await prisma.user.update({
    where: { id: req.params.id },
    data: { status: "INACTIVE" },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user.sub,
      action: "user_deactivated",
      resourceType: "user",
      resourceId: req.params.id,
      details: { reason },
    },
  });

  res.json({
    status: 200,
    data: {
      id: req.params.id,
      status: "INACTIVE",
      message: "User deactivated successfully",
    },
  });
});

const reactivateUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user)
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "User not found" },
      });

  await prisma.user.update({
    where: { id: req.params.id },
    data: { status: "ACTIVE" },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user.sub,
      action: "user_reactivated",
      resourceType: "user",
      resourceId: req.params.id,
    },
  });

  res.json({
    status: 200,
    data: {
      id: req.params.id,
      status: "ACTIVE",
      message: "User reactivated successfully",
    },
  });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const [
    students,
    employers,
    listings,
    applications,
    activeListings,
    pendingApprovals,
    accepted,
    newUsers,
    topFields,
  ] = await prisma.$transaction([
    prisma.user.count({ where: { role: "STUDENT", status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "EMPLOYER", status: "ACTIVE" } }),
    prisma.listing.count(),
    prisma.application.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "PENDING" } }),
    prisma.application.count({ where: { status: "ACCEPTED" } }),
    prisma.user.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.listing.groupBy({
      by: ["jobField"],
      where: { status: "ACTIVE" },
      _count: { jobField: true },
      orderBy: { _count: { jobField: "desc" } },
      take: 3,
    }),
  ]);

  res.json({
    status: 200,
    data: {
      analytics: {
        total_students: students,
        total_employers: employers,
        total_listings: listings,
        total_applications: applications,
        active_listings: activeListings,
        pending_approvals: pendingApprovals,
        application_success_rate:
          applications > 0
            ? parseFloat((accepted / applications).toFixed(2))
            : 0,
        new_users_this_month: newUsers,
        trending_job_fields: topFields.map((f) => f.jobField),
      },
    },
  });
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const l = Math.min(100, Math.max(1, parseInt(limit) || 50));
  const p = Math.max(1, parseInt(page) || 1);
  const skip = (p - 1) * l;

  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      take: l,
      skip,
      orderBy: { timestamp: "desc" },
      include: { user: { select: { email: true, role: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  res.json({ status: 200, data: { logs, pagination: paginate(p, l, total) } });
});

module.exports = {
  getUserById,
  getUsers,
  getPendingEmployers,
  approveEmployer,
  rejectEmployer,
  deactivateUser,
  reactivateUser,
  getAnalytics,
  getAuditLogs,
};
