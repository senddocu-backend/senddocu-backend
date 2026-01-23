const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../../config/db");

const auth = require("../../middleware/auth.middleware");

const router = express.Router();

/* Ensure upload directory exists */
const UPLOAD_DIR = path.join(__dirname, "../../uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/* Storage config */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

/* File filter */
const allowedTypes = [
  ".pdf",
  ".doc",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedTypes.includes(ext)) {
    return cb(new Error("INVALID_FILE_TYPE"));
  }
  cb(null, true);
};

/* Multer instance */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

/* Protected upload route */
router.post("/upload", auth, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "NO_FILE_UPLOADED" });
  }

  res.status(201).json({
    message: "UPLOAD_SUCCESS",
    filename: req.file.filename,
    uploadedBy: req.user.id,
  });
});

module.exports = router;
