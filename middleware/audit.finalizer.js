const { writeAuditLog } = require("../lib/audit.writer");

module.exports = function auditFinalizer(req, res, next) {
  res.on("finish", () => {
    const user = req.user || {};

    writeAuditLog({
      tenant_id: user.tenantId,
      user_id: user.userId,
      role: user.role,

      actor_type: user.userId ? "user" : "system",
      actor_identifier: user.userId
        ? `user:${user.userId}`
        : "anonymous",

      action: `${req.method} ${req.originalUrl}`,
      resource: req.baseUrl || "unknown",
      resource_id: req.params?.id || null,
      envelope_id: req.params?.envelopeId || null,

      ip_address: req.ip,
      user_agent: req.headers["user-agent"],

      success: res.statusCode < 400,
      error_code: res.statusCode >= 400
        ? String(res.statusCode)
        : null
    });
  });

  next();
};
