const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const crypto = require("crypto");
const auth = require("../../middleware/auth.middleware");

router.post("/:id/send", auth, async (req, res) => {
  const envelopeId = parseInt(req.params.id, 10);

  try {
    // 1. Validate envelope
    const env = await db.query(
      "SELECT status FROM envelopes WHERE id = $1",
      [envelopeId]
    );

    if (!env.rows.length) {
      return res.status(404).json({ error: "ENVELOPE_NOT_FOUND" });
    }

    if (env.rows[0].status !== "draft") {
      return res.status(400).json({ error: "ENVELOPE_NOT_IN_DRAFT" });
    }

    // 2. Load recipients
    const recipients = await db.query(
      "SELECT id FROM recipients WHERE envelope_id = $1",
      [envelopeId]
    );

    if (!recipients.rows.length) {
      return res.status(400).json({ error: "NO_RECIPIENTS" });
    }

    // 3. Generate signing tokens
    for (const r of recipients.rows) {
      const token = crypto.randomUUID();
      await db.query(
        `UPDATE recipients
         SET signing_token = $1
         WHERE id = $2`,
        [token, r.id]
      );
    }

    // 4. Update envelope status
    await db.query(
      "UPDATE envelopes SET status = 'sent' WHERE id = $1",
      [envelopeId]
    );

    // 5. Return signing links
    const links = await db.query(
      `SELECT id, email, signing_token
       FROM recipients
       WHERE envelope_id = $1`,
      [envelopeId]
    );

    return res.json({
      envelopeId,
      status: "sent",
      signingLinks: links.rows.map(r => ({
        recipientId: r.id,
        email: r.email,
        url: `${process.env.APP_URL}/sign/${r.signing_token}`
      }))
    });

  } catch (err) {
    console.error("SEND ENVELOPE ERROR:", err);
    return res.status(500).json({ error: "SEND_FAILED" });
  }
});

module.exports = router;
