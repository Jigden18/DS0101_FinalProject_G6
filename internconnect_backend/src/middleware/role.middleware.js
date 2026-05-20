const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 403,
        error: {
          code: "FORBIDDEN",
          message: "You don't have permission to access this resource",
        },
      });
    }
    next();
  };

module.exports = { requireRole };
