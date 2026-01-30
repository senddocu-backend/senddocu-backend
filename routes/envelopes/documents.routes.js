const express = require("express");
const router = express.Router();
const db = require("../../config/db");

// POST /envelopes/:id/documents
router.post("/:id/documents", async (req, res) => {
  const envelopeId = parseInt(req.params.id, 10);
  const documentId = parseInt(req.body.documentId, 10);

  if (Number.isNaN(envelopeId) || Number.isNaN(documentId)) {
    return res.status(400).json({ error: "INVALID_INPUT" });
  }

  try {
    // 1️⃣ Check envelope status
    const env = await db.query(
      `SELECT status
       FROM envelopes
       WHERE id = $1`,
      [envelopeId]
    );

    if (!env.rows.length) {
      return res.status(404).json({ error: "ENVELOPE_NOT_FOUND" });
    }

    if (env.rows[0].status !== "draft") {
      return res.status(400).json({
        error: "ENVELOPE_LOCKED",
        message: "Documents can only be attached to draft envelopes",
      });
    }

    // 2️⃣ Attach document
    await db.query(
      `UPDATE documents
       SET envelope_id = $1
       WHERE id = $2`,
      [envelopeId, documentId]
    );

    return res.json({
      envelopeId,
      documentId,
      status: "attached",
    });

  } catch (err) {
    console.error("ATTACH DOCUMENT ERROR:", err);
    return res.status(500).json({ error: "ATTACH_DOCUMENT_FAILED" });
  }
});

module.exports = router;
