// utils/audit.js
const { query } = require("../config/db");

module.exports = async function audit({
  tenantId,
  actorUserId = null,
  actorRole = null,
  entityType,
  entityId = null,
  action,
  req = null,
  metadata = null
}) {
  try {
    await query(
      `
      INSERT INTO audit_events (
        tenant_id,
        actor_user_id,
        actor_role,
        entity_type,
        entity_id,
        action,
        ip_address,
        user_agent,
        metadata
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [
        tenantId,
        actorUserId,
        actorRole,
        entityType,
        entityId,
        action,
        req?.ip || null,
        req?.headers["user-agent"] || null,
        metadata
      ]
    );
  } catch (err) {
    // 🔒 Audit must NEVER crash the app
    console.error("AUDIT LOG FAILED:", err.message);
  }
};
