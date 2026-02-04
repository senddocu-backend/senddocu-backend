const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const { STATES, assertTransition } = require("../../services/envelope.lifecycle");
// POST /envelopes/:id/send
router.post("/:id/send", async (req, res) => {
  const envelopeId = Number(req.params.id);
  const userId = req.user.userId;

  try {
    await db.query("BEGIN");
assertTransition(envelope.status, STATES.SENT);
    // 1️⃣ Lock envelope
    const { rows: envelopes } = await db.query(
      `
      SELECT id, status
      FROM envelopes
      WHERE id = $1
      FOR UPDATE
      `,
      [envelopeId]
    );

    if (!envelopes.length) {
      await db.query("ROLLBACK");
      return res.status(404).json({ error: "ENVELOPE_NOT_FOUND" });
    }

    if (envelopes[0].status !== "draft") {
      await db.query("ROLLBACK");
      return res.status(400).json({ error: "ENVELOPE_NOT_DRAFT" });
    }

    // 2️⃣ Ensure documents attached
    const { rows: docs } = await db.query(
      `SELECT 1 FROM documents WHERE envelope_id = $1 LIMIT 1`,
      [envelopeId]
    );

    if (!docs.length) {
      await db.query("ROLLBACK");
      return res.status(400).json({ error: "NO_DOCUMENTS_ATTACHED" });
    }

    // 3️⃣ Ensure recipients exist
    const { rows: recipients } = await db.query(
      `SELECT id FROM recipients WHERE envelope_id = $1`,
      [envelopeId]
    );

    if (!recipients.length) {
      await db.query("ROLLBACK");
      return res.status(400).json({ error: "NO_RECIPIENTS" });
    }

    // 4️⃣ Generate signing tokens if missing
    await db.query(
      `
      UPDATE recipients
      SET signing_token = COALESCE(signing_token, gen_random_uuid()::text)
      WHERE envelope_id = $1
      `,
      [envelopeId]
    );

    // 5️⃣ Mark envelope as SENT
    await db.query(
      `
      UPDATE envelopes
      SET status = 'sent',
          sent_at = NOW(),
          sent_by = $2
      WHERE id = $1
      `,
      [envelopeId, userId]
    );

    await db.query("COMMIT");

    return res.json({
      envelopeId,
      status: "SENT",
      recipients: recipients.length
    });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("ENVELOPE SEND ERROR:", err);
    return res.status(500).json({ error: "SEND_FAILED" });
  }
});

module.exports = router;
