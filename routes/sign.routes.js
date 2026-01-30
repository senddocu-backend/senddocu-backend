const express = require("express");
const router = express.Router();
const db = require("../config/db");

// POST /sign/:signing_token
router.post("/:token", async (req, res) => {
  const { token } = req.params;

  try {
    await db.query("BEGIN");

    // 1. Fetch recipient + envelope
    const { rows } = await db.query(
      `
      SELECT r.id AS recipient_id,
             r.signed_at,
             e.id AS envelope_id,
             e.status
      FROM recipients r
      JOIN envelopes e ON e.id = r.envelope_id
      WHERE r.signing_token = $1
      FOR UPDATE
      `,
      [token]
    );

    if (!rows.length) {
      await db.query("ROLLBACK");
      return res.status(404).json({ error: "INVALID_SIGNING_TOKEN" });
    }

    const row = rows[0];

    // 2. Envelope must be sent
    if (row.status !== "sent") {
      await db.query("ROLLBACK");
      return res.status(400).json({ error: "ENVELOPE_NOT_SIGNABLE" });
    }

    // 3. Prevent double signing
    if (row.signed_at) {
      await db.query("ROLLBACK");
      return res.status(409).json({ error: "ALREADY_SIGNED" });
    }

    // 4. Mark recipient signed
    await db.query(
      `
      UPDATE recipients
      SET signed_at = NOW(),
          status = 'signed'
      WHERE id = $1
      `,
      [row.recipient_id]
    );

    // 5. Auto-complete envelope if all signed (trigger handles it)
    await db.query("COMMIT");

    return res.json({
      status: "SIGNED",
      envelopeId: row.envelope_id
    });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("SIGN ERROR:", err);
    return res.status(500).json({ error: "SIGN_FAILED" });
  }
});

module.exports = router;
