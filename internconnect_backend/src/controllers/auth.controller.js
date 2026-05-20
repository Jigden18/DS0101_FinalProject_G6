const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const { asyncHandler } = require("../middleware/error.middleware");

const registerStudent = asyncHandler(async (req, res) => {
  const { full_name, email, password, university, course, graduation_year } =
    req.body;
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      role: "STUDENT",
      status: "ACTIVE",
      student: {
        create: {
          fullName: full_name,
          university,
          course,
          graduationYear: parseInt(graduation_year),
        },
      },
    },
    select: { id: true, email: true, role: true, status: true },
  });

  const token = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  res.status(201).json({ status: 201, data: { user, token } });
});

const registerEmployer = asyncHandler(async (req, res) => {
  const { company_name, contact_person, email, password, industry, location } =
    req.body;
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      role: "EMPLOYER",
      status: "PENDING",
      employer: {
        create: {
          companyName: company_name,
          contactPerson: contact_person,
          industry,
          location,
        },
      },
    },
    select: { id: true, email: true, role: true, status: true },
  });

  res.status(201).json({
    status: 201,
    data: {
      ...user,
      message: "Registration submitted. Awaiting admin approval.",
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      student: { select: { fullName: true } },
      employer: { select: { companyName: true } },
      admin: { select: { fullName: true } },
    },
  });

  if (!user) {
    return res
      .status(401)
      .json({
        status: 401,
        error: { code: "UNAUTHORIZED", message: "Invalid email or password" },
      });
  }
  if (user.status === "PENDING") {
    return res
      .status(403)
      .json({
        status: 403,
        error: { code: "FORBIDDEN", message: "Account pending admin approval" },
      });
  }
  if (user.status === "INACTIVE") {
    return res
      .status(403)
      .json({
        status: 403,
        error: { code: "FORBIDDEN", message: "Account deactivated" },
      });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res
      .status(401)
      .json({
        status: 401,
        error: { code: "UNAUTHORIZED", message: "Invalid email or password" },
      });
  }

  const payload = { sub: user.id, email: user.email, role: user.role };
  const token = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const name =
    user.student?.fullName ||
    user.employer?.companyName ||
    user.admin?.fullName;

  res.json({
    status: 200,
    data: {
      user: { id: user.id, email: user.email, name, role: user.role },
      token,
      refreshToken,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  res.json({ status: 200, data: { message: "Logged out successfully" } });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res
      .status(400)
      .json({
        status: 400,
        error: {
          code: "VALIDATION_ERROR",
          message: "refresh_token is required",
        },
      });
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refresh_token);
  } catch {
    return res
      .status(401)
      .json({
        status: 401,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or expired refresh token",
        },
      });
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || user.status !== "ACTIVE") {
    return res
      .status(401)
      .json({
        status: 401,
        error: { code: "UNAUTHORIZED", message: "User not found or inactive" },
      });
  }

  const token = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  res.json({ status: 200, data: { token } });
});

// ── Forgot Password ───────────────────────────────────────────────────────────
// In production wire this up to an email service (SendGrid, SES, etc.).
// For now the reset token is returned directly in the response so you can
// test without an email server — remove that in production.
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({
        status: 400,
        error: { code: "VALIDATION_ERROR", message: "Email is required" },
      });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Always return 200 — never reveal whether the email exists
  if (!user) {
    return res.json({
      status: 200,
      data: {
        message:
          "If that email is registered you will receive a reset link shortly",
      },
    });
  }

  // Invalidate any existing unused tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  const { v4: uuidv4 } = require("uuid");
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  // TODO: replace this with an actual email — e.g.:
  // await sendEmail({ to: user.email, subject: 'Reset your password', body: `Use token: ${token}` })

  res.json({
    status: 200,
    data: {
      message:
        "If that email is registered you will receive a reset link shortly",
      // ⚠️ Remove reset_token from response in production — only here for development testing
      ...(process.env.NODE_ENV !== "production" && { reset_token: token }),
    },
  });
});

// ── Reset Password ────────────────────────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { token, new_password } = req.body;
  if (!token || !new_password) {
    return res
      .status(400)
      .json({
        status: 400,
        error: {
          code: "VALIDATION_ERROR",
          message: "token and new_password are required",
        },
      });
  }
  if (new_password.length < 6) {
    return res
      .status(400)
      .json({
        status: 400,
        error: {
          code: "VALIDATION_ERROR",
          message: "Password must be at least 6 characters",
        },
      });
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
    return res
      .status(400)
      .json({
        status: 400,
        error: {
          code: "INVALID_TOKEN",
          message: "Reset token is invalid or has expired",
        },
      });
  }

  const passwordHash = await bcrypt.hash(new_password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    }),
  ]);

  res.json({
    status: 200,
    data: { message: "Password reset successfully. You can now log in." },
  });
});

module.exports = {
  registerStudent,
  registerEmployer,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
};
