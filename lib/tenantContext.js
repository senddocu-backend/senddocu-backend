const db = require("./db");

/**
 * Load tenant context and attach to req.tenant
 * Enforces tenant existence and region rules
 */
async function loadTenantContext(tenantId) {
  if (!tenantId) {
    throw new Error("TENANT_ID_MISSING");
  }

  const { rows } = await db.pool.query(
    `
    SELECT
      id,
      name,
      country_code,
      data_region,
      region_locked
    FROM tenants
    WHERE id = $1
    `,
    [tenantId]
  );

  if (rows.length === 0) {
    throw new Error("TENANT_NOT_FOUND");
  }

  const tenant = rows[0];

  // Hard region enforcement (data-localization)
  if (
    tenant.region_locked &&
    process.env.DATA_REGION &&
    tenant.data_region !== process.env.DATA_REGION
  ) {
    throw new Error("TENANT_REGION_MISMATCH");
  }

  return tenant;
}

module.exports = {
  loadTenantContext
};
