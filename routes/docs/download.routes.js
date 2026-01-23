const express = require("express");
const path = require("path");
const db = require("../../config/db");


const router = express.Router();

router.get("/download/:id", async (req, res) => {
  try {
    const userId = req.user.userId;
    const docId = req.params.id;

    const result = await pool.query(
      `
      SELECT stored_filename, original_filename
      FROM documents
      WHERE id = $1 AND user_id = $2
      `,
      [docId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "DOCUMENT_NOT_FOUND" });
    }

    const doc = result.rows[0];
    const filePath = path.join(
      __dirname,
      "../../uploads",
      doc.stored_filename
    );

    return res.download(filePath, doc.original_filename);
  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);
    return res.status(500).json({ error: "DOWNLOAD_FAILED" });
  }
});

module.exports = router;
