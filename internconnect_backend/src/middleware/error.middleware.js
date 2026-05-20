const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Prisma unique constraint
  if (err.code === "P2002") {
    return res.status(409).json({
      status: 409,
      error: {
        code: "DUPLICATE_ENTRY",
        message: `${err.meta?.target?.join(", ")} already exists`,
      },
    });
  }
  // Prisma record not found
  if (err.code === "P2025") {
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "Resource not found" },
      });
  }
  // Prisma foreign key constraint
  if (err.code === "P2003") {
    return res
      .status(404)
      .json({
        status: 404,
        error: { code: "NOT_FOUND", message: "Referenced resource not found" },
      });
  }

  const status = err.status || 500;
  res.status(status).json({
    status,
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "An unexpected error occurred",
      ...(err.details && { details: err.details }),
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

// Wraps async route handlers to forward errors to errorHandler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };
