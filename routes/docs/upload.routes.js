const express = require("express");
const multer = require("multer");
const path = require("path");
const pool = require("../../config/db");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "NO_FILE_UPLOADED" });
      }

      await pool.query(
        `INSERT INTO documents (stored_filename, original_filename, uploaded_by)
         VALUES ($1, $2, $3)`,
        [
          req.file.filename,
          req.file.originalname,
          req.user.userId,
        ]
      );

      res.json({
        message: "Upload successful",
        storedFilename: req.file.filename,
        originalFilename: req.file.originalname,
      });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ error: "UPLOAD_FAILED" });
    }
  }
);

module.exports = router;
