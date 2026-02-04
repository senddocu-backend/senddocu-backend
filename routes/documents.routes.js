const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const db = require("../config/db");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

/* =========================
   FILE STORAGE
========================= */
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const storedName = crypto.randomUUID() + ext;
    cb(null, storedName);
  },
});

const upload = multer({ storage });

/* =========================
   UPLOAD DOCUMENT
========================= */
router.post(
  "/upload",
  auth,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "NO_FILE_UPLOADED" });
    }

    try {
      const buffer = fs.readFileSync(req.file.path);
      const hash = crypto.createHash("sha256").update(buffer).digest("hex");

      const result = await db.query(
        `
        INSERT INTO documents (
          stored_filename,
          original_filename,
          uploaded_by,
          tenant_id,
          file_hash
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        `,
        [
          req.file.filename,          // stored_filename
          req.file.originalname,      // original_filename
          req.user.id,                // uploaded_by
          req.user.tenantId,          // tenant_id
          hash                         // file_hash
        ]
      );

      res.json({
        id: result.rows[0].id,
        status: "UPLOADED",
        originalName: req.file.originalname
      });

    } catch (err) {
      console.error("DOCUMENT UPLOAD ERROR:", err);
      res.status(500).json({ error: "UPLOAD_FAILED" });
    }
  }
);

module.exports = router;
