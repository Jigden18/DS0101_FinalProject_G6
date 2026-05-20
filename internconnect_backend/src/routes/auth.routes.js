const express = require("express");
const router = express.Router();
const {
  registerStudent,
  registerEmployer,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.post("/register/student", registerStudent);
router.post("/register/employer", registerEmployer);
router.post("/login", login);
router.post("/logout", authenticate, logout);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
