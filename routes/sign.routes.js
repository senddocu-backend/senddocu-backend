const express = require("express");
const router = express.Router();

const { query } = require("../config/db");
const audit = require("../utils/audit");

router.post("/:token", async (req, res) => {
  const { token } = req.params;

  try {
    await query("BEGIN");
const { rows } = await query(
  `
  SELECT
    r.id AS recipient_id,
    r.email,
    r.signed_at,
    r.signing_order,
    r.signing_expires_at,
    e.id AS envelope_id,
    e.status,
    e.tenant_id
  FROM recipients r
  JOIN envelopes e ON e.id = r.envelope_id
  WHERE r.signing_token = $1
    AND r.signing_order = (
      SELECT MIN(signing_order)
      FROM recipients
      WHERE envelope_id = e.id
        AND signed_at IS NULL
    )
  FOR UPDATE
  `,
  [token]
);

    if (!rows.length) {
      await query("ROLLBACK");
      return res.status(404).json({ error: "INVALID_OR_OUT_OF_ORDER_TOKEN" });
    }

    const row = rows[0];

    if (row.status !== "sent") {
      await query("ROLLBACK");
      return res.status(400).json({ error: "ENVELOPE_NOT_SIGNABLE" });
    }

    if (row.signed_at) {
      await query("ROLLBACK");
      return res.status(409).json({ error: "ALREADY_SIGNED" });
    }

   if (row.signing_expires_at && row.signing_expires_at < new Date()) {
  await query("ROLLBACK");
  return res.status(410).json({ error: "SIGNING_LINK_EXPIRED" });
}

    await query(
      `
      UPDATE recipients
      SET signed_at = NOW(),
          status = 'signed'
      WHERE id = $1
      `,
      [row.recipient_id]
    );

    await query("COMMIT");

    // 🔐 AUDIT — NON BLOCKING (CRITICAL RULE)
    audit({
      tenantId: row.tenant_id,
      actorUserId: null,
      actorRole: "signer",
      entityType: "recipient",
      entityId: row.recipient_id,
      action: "SIGNED",
      req
    }).catch(err => {
      console.error("AUDIT FAILED:", err);
    });

    return res.json({
      status: "SIGNED",
      envelopeId: row.envelope_id
    });

  } catch (err) {
    await query("ROLLBACK");
    console.error("SIGN ERROR:", err);
    return res.status(500).json({ error: "SIGN_FAILED" });
  }
});

module.exports = router;
