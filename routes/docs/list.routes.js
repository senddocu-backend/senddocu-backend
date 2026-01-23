const express = require("express");
const db = require("../../config/db");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/list", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, original_filename, uploaded_at
       FROM documents
       WHERE uploaded_by = $1
       ORDER BY uploaded_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("LIST ERROR:", err);
    res.status(500).json({ error: "FAILED_TO_FETCH_FILES" });
  }
});

module.exports = router;
