const db = require("../lib/db");

/**
 * Add recipients to an envelope
 */
async function addRecipients(envelopeId, tenantId, recipients) {
  // Ensure envelope belongs to tenant
  const env = await db.query(
    `SELECT id FROM envelopes WHERE id = $1 AND tenant_id = $2`,
    [envelopeId, tenantId]
  );

  if (!env.rows.length) {
    throw new Error("ENVELOPE_NOT_FOUND");
  }

  for (const r of recipients) {
    await db.query(
      `
      INSERT INTO recipients (
        envelope_id,
        email,
        role,
        signing_order
      )
      VALUES ($1, $2, $3, $4)
      `,
      [
        envelopeId,
        r.email,
        r.role,
        r.signOrder ?? null
      ]
    );
  }
}

async function getRecipients(envelopeId, tenantId) {
  const env = await db.query(
    `SELECT id FROM envelopes WHERE id = $1 AND tenant_id = $2`,
    [envelopeId, tenantId]
  );

  if (!env.rows.length) {
    throw new Error("ENVELOPE_NOT_FOUND");
  }

  const result = await db.query(
    `
    SELECT id, email, role, signing_order, signed_at
    FROM recipients
    WHERE envelope_id = $1
    ORDER BY signing_order NULLS LAST
    `,
    [envelopeId]
  );

  return result.rows;
}

module.exports = {
  addRecipients,
  getRecipients
};
