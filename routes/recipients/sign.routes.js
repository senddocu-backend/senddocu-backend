const express = require("express");
const router = express.Router();
const db = require("../../config/db");

/**
 * POST /recipients/sign/:token
 * Public signing endpoint (NO AUTH)
 */
router.post("/sign/:token", async (req, res) => {
  const { token } = req.params;

  if (!token || token.length < 20) {
    return res.status(400).json({ error: "INVALID_SIGN_TOKEN" });
  }

  try {
    // 1. Validate token
    const recipient = await db.query(
      `
      SELECT id, envelope_id, signed_at
      FROM recipients
      WHERE signing_token = $1
      `,
      [token]
    );

    if (recipient.rowCount === 0) {
      return res.status(400).json({ error: "INVALID_SIGN_TOKEN" });
    }

    if (recipient.rows[0].signed_at) {
      return res.status(400).json({ error: "ALREADY_SIGNED" });
    }

    // 2. Mark as signed
    const update = await db.query(
      `
      UPDATE recipients
      SET signed_at = NOW()
      WHERE signing_token = $1
        AND signed_at IS NULL
      RETURNING id, signed_at
      `,
      [token]
    );

    if (update.rowCount === 0) {
      return res.status(400).json({ error: "SIGN_FAILED" });
    }

    return res.json({
      recipient_id: update.rows[0].id,
      signed_at: update.rows[0].signed_at,
      status: "SIGNED"
    });

  } catch (err) {
    console.error("SIGN ROUTE ERROR:", err);
    return res.status(500).json({ error: "SIGN_FAILED" });
  }
});

module.exports = router;
