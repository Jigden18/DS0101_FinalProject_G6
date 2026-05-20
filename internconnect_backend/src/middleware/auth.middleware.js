const { verifyAccessToken } = require("../utils/jwt");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({
        status: 401,
        error: { code: "UNAUTHORIZED", message: "No token provided" },
      });
  }
  try {
    req.user = verifyAccessToken(authHeader.split(" ")[1]);
    next();
  } catch {
    res
      .status(401)
      .json({
        status: 401,
        error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
      });
  }
};

module.exports = { authenticate };
