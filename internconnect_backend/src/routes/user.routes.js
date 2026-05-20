const express = require("express");
const router = express.Router();
const {
  getUser,
  updateUser,
  uploadAvatar,
  deleteUser,
  changePassword,
} = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.middleware");
const {
  uploadAvatar: uploadAvatarMiddleware,
} = require("../middleware/upload.middleware");

router.get("/:id", authenticate, getUser);
router.put("/:id", authenticate, updateUser);
router.post("/:id/avatar", authenticate, uploadAvatarMiddleware, uploadAvatar);
router.delete("/:id", authenticate, deleteUser);
router.post("/:id/change-password", authenticate, changePassword);

module.exports = router;
