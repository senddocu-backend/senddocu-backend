const express = require("express");
const router = express.Router();
const db = require("../../config/db");

/**
 * GET /envelopes/recipients/sign/:token
 */
router.get("/recipients/sign/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const result = await db.query(
      `SELECT r.id AS recipient_id,
              r.name,
              r.email,
              r.signed_at,
              e.id AS envelope_id,
              e.status
       FROM recipients r
       JOIN envelopes e ON e.id = r.envelope_id
       WHERE r.signing_token = $1`,
      [token]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "INVALID_SIGNING_TOKEN" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("SIGN VIEW ERROR:", err);
    return res.status(500).json({ error: "SIGN_VIEW_FAILED" });
  }
});

/**
 * POST /envelopes/recipients/sign/:token
 */
router.post("/recipients/sign/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const rec = await db.query(
      `SELECT id, envelope_id, signed_at
       FROM recipients
       WHERE signing_token = $1`,
      [token]
    );

    if (!rec.rows.length) {
      return res.status(404).json({ error: "INVALID_SIGNING_TOKEN" });
    }

    if (rec.rows[0].signed_at) {
      return res.status(400).json({ error: "ALREADY_SIGNED" });
    }

    await db.query(
      `UPDATE recipients
       SET signed_at = NOW()
       WHERE id = $1`,
      [rec.rows[0].id]
    );

    const pending = await db.query(
      `SELECT 1
       FROM recipients
       WHERE envelope_id = $1
         AND signed_at IS NULL`,
      [rec.rows[0].envelope_id]
    );

    if (!pending.rows.length) {
      await db.query(
        `UPDATE envelopes
         SET status = 'completed',
             completed_at = NOW()
         WHERE id = $1`,
        [rec.rows[0].envelope_id]
      );
    }

    return res.json({ status: "SIGNED" });
  } catch (err) {
    console.error("SIGN ERROR:", err);
    return res.status(500).json({ error: "SIGN_FAILED" });
  }
});

module.exports = router;
