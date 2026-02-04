const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const auth = require("../../middleware/auth.middleware");

router.post("/", auth, async (req, res) => {
  try {
    const { subject, message } = req.body;
    const { userId, tenantId } = req.user;

    if (!subject) {
      return res.status(400).json({ error: "SUBJECT_REQUIRED" });
    }

    const result = await db.query(
      `
      INSERT INTO envelopes (tenant_id, created_by, subject, message, status)
      VALUES ($1, $2, $3, $4, 'draft')
      RETURNING id, status, created_at
      `,
      [tenantId, userId, subject, message || null]
    );

    const envelope = result.rows[0];

    return res.status(201).json({
      id: envelope.id,
      status: envelope.status,
      createdAt: envelope.created_at,
    });

  } catch (err) {
    console.error("CREATE_ENVELOPE_FAILED:", err);
    return res.status(500).json({ error: "CREATE_ENVELOPE_FAILED" });
  }
});

module.exports = router;
