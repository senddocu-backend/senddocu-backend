const db = require("./db");

async function writeAuditLog(entry) {
  try {
    await db.pool.query(
      `
      INSERT INTO audit_logs (
        tenant_id,
        user_id,
        role,
        actor_type,
        actor_identifier,
        action,
        resource,
        resource_id,
        envelope_id,
        ip_address,
        user_agent,
        success,
        error_code
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      `,
      [
        entry.tenant_id || null,
        entry.user_id || null,
        entry.role || null,
        entry.actor_type,
        entry.actor_identifier,
        entry.action,
        entry.resource,
        entry.resource_id || null,
        entry.envelope_id || null,
        entry.ip_address,
        entry.user_agent,
        entry.success,
        entry.error_code || null
      ]
    );
  } catch (err) {
    // NEVER throw — audit must not break app
    console.error("AUDIT WRITE FAILED", err.message);
  }
}

module.exports = { writeAuditLog };
