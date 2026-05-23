require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// ── Ensure upload directories exist on startup ───────────────────
fs.mkdirSync(path.join(__dirname, "../uploads/resumes"), { recursive: true });
fs.mkdirSync(path.join(__dirname, "../uploads/avatars"), { recursive: true });

const app = express();

// ── Core middleware ───────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files — serve uploads so frontend can access files directly ──
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Health check ──────────────────────────────────────────────────
app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() }),
);

// ── API Routes ────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/listings", require("./routes/listing.routes"));
app.use("/api/applications", require("./routes/application.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/search", require("./routes/search.routes"));
app.use("/api/constants", require("./routes/constants.routes"));

// ── 404 ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({
      status: 404,
      error: { code: "NOT_FOUND", message: "Route not found" },
    });
});

// ── Global error handler (must be last) ──────────────────────────
const { errorHandler } = require("./middleware/error.middleware");
app.use(errorHandler);


module.exports = app;
