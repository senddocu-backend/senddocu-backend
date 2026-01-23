const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const auth = require("../../middleware/auth");

router.use(auth);

/**
 * POST /envelopes/:id/send
 */
router.post("/:id/send", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  const envelopeId = Number(req.params.id);
  const tenantId = req.user.tenantId;

  try {
    // Validate envelope
    const env = await db.query(
      `SELECT id, status
       FROM envelopes
       WHERE id = $1 AND tenant_id = $2`,
      [envelopeId, tenantId]
    );

    if (!env.rows.length) {
      return res.status(404).json({ error: "ENVELOPE_NOT_FOUND" });
    }

    if (env.rows[0].status !== "draft") {
      return res.status(400).json({ error: "INVALID_STATE" });
    }

    // Ensure recipients exist
    const rec = await db.query(
      `SELECT id FROM recipients WHERE envelope_id = $1`,
      [envelopeId]
    );

    if (!rec.rows.length) {
      return res.status(400).json({ error: "NO_RECIPIENTS" });
    }

    // Mark as sent
    await db.query(
      `UPDATE envelopes
       SET status = 'sent', sent_at = NOW()
       WHERE id = $1`,
      [envelopeId]
    );

    return res.json({
      id: envelopeId,
      status: "sent",
    });
  } catch (err) {
    console.error("SEND ERROR:", err);
    return res.status(500).json({ error: "SEND_FAILED" });
  }
});

module.exports = router;
