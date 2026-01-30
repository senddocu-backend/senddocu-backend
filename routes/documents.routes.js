const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/auth.middleware");

// 🔐 Protect all document routes
router.use(authMiddleware);

// 📄 GET /documents
router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      `
      SELECT
        id,
        original_filename,
        stored_filename,
        uploaded_at,
        envelope_id
      FROM documents
      WHERE uploaded_by = $1
      ORDER BY uploaded_at DESC
      `,
      [userId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("DOCUMENT LIST ERROR:", err);
    return res.status(500).json({ error: "DOCUMENT_LIST_FAILED" });
  }
});

module.exports = router;
