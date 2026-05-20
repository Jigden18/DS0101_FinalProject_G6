const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { asyncHandler } = require("../middleware/error.middleware");

const getUser = asyncHandler(async (req, res) => {
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

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.sub !== id && req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({
        status: 403,
        error: {
          code: "FORBIDDEN",
          message: "You can only update your own profile",
        },
      });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!user)
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "User not found" },
      });

  if (user.role === "STUDENT") {
    const { full_name, university, course, graduation_year, bio, skills } =
      req.body;
    await prisma.student.update({
      where: { id },
      data: {
        ...(full_name && { fullName: full_name }),
        ...(university && { university }),
        ...(course && { course }),
        ...(graduation_year && { graduationYear: parseInt(graduation_year) }),
        ...(bio !== undefined && { bio }),
        ...(skills && { skills }),
      },
    });
  } else if (user.role === "EMPLOYER") {
    const {
      company_name,
      contact_person,
      industry,
      location,
      company_bio,
      website_url,
      company_size,
    } = req.body;
    await prisma.employer.update({
      where: { id },
      data: {
        ...(company_name && { companyName: company_name }),
        ...(contact_person && { contactPerson: contact_person }),
        ...(industry && { industry }),
        ...(location && { location }),
        ...(company_bio !== undefined && { companyBio: company_bio }),
        ...(website_url !== undefined && { websiteUrl: website_url }),
        ...(company_size !== undefined && { companySize: company_size }),
      },
    });
  }

  res.json({
    status: 200,
    data: { id, message: "Profile updated successfully" },
  });
});

const uploadAvatar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.sub !== id) {
    return res
      .status(403)
      .json({
        status: 403,
        error: {
          code: "FORBIDDEN",
          message: "You can only update your own avatar",
        },
      });
  }
  if (!req.file || !req.fileUrl) {
    return res
      .status(400)
      .json({
        status: 400,
        error: { code: "VALIDATION_ERROR", message: "No file uploaded" },
      });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!user)
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "User not found" },
      });

  if (user.role === "STUDENT") {
    await prisma.student.update({
      where: { id },
      data: { avatarUrl: req.fileUrl },
    });
  } else if (user.role === "EMPLOYER") {
    await prisma.employer.update({
      where: { id },
      data: { logoUrl: req.fileUrl },
    });
  }

  res.json({
    status: 200,
    data: {
      id,
      avatar_url: req.fileUrl,
      message: "Avatar uploaded successfully",
    },
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.sub !== id && req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({
        status: 403,
        error: { code: "FORBIDDEN", message: "Forbidden" },
      });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user)
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "User not found" },
      });

  // Soft delete — set INACTIVE
  await prisma.user.update({ where: { id }, data: { status: "INACTIVE" } });
  res.json({
    status: 200,
    data: { message: "Account deactivated successfully" },
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.user.sub !== id) {
    return res
      .status(403)
      .json({
        status: 403,
        error: { code: "FORBIDDEN", message: "Forbidden" },
      });
  }

  const { current_password, new_password } = req.body;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { passwordHash: true },
  });
  if (!user)
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "User not found" },
      });

  const valid = await bcrypt.compare(current_password, user.passwordHash);
  if (!valid) {
    return res
      .status(400)
      .json({
        status: 400,
        error: {
          code: "INVALID_PASSWORD",
          message: "Current password is incorrect",
        },
      });
  }

  const passwordHash = await bcrypt.hash(new_password, 12);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  res.json({ status: 200, data: { message: "Password changed successfully" } });
});

module.exports = {
  getUser,
  updateUser,
  uploadAvatar,
  deleteUser,
  changePassword,
};
