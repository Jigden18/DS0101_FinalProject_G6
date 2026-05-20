const multer = require("multer");
const path = require("path");

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../../uploads/resumes")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../../uploads/avatars")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const resumeFilter = (req, file, cb) =>
  file.mimetype === "application/pdf"
    ? cb(null, true)
    : cb(new Error("Only PDF files are allowed for resumes"));

const imageFilter = (req, file, cb) =>
  ["image/jpeg", "image/png"].includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only JPEG and PNG files are allowed for avatars"));

const MAX_RESUME =
  (parseInt(process.env.MAX_RESUME_SIZE_MB) || 5) * 1024 * 1024;
const MAX_AVATAR =
  (parseInt(process.env.MAX_AVATAR_SIZE_MB) || 2) * 1024 * 1024;

const _uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFilter,
  limits: { fileSize: MAX_RESUME },
}).single("resume");
const _uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_AVATAR },
}).single("avatar");

// Wrap multer to return clean errors and attach the full file URL to req.fileUrl
const handleUpload = (uploader, folder) => (req, res, next) => {
  uploader(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .json({
          status: 400,
          error: { code: "UPLOAD_ERROR", message: err.message },
        });
    }
    if (req.file) {
      req.fileUrl = `${req.protocol}://${req.get("host")}/uploads/${folder}/${req.file.filename}`;
    }
    next();
  });
};

const uploadResume = handleUpload(_uploadResume, "resumes");
const uploadAvatar = handleUpload(_uploadAvatar, "avatars");

module.exports = { uploadResume, uploadAvatar };
