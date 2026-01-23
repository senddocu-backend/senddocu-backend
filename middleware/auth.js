const { verifyToken } = require("../utils/jwt");

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "MISSING_TOKEN" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "INVALID_TOKEN_FORMAT" });
  }

  try {
    const decoded = verifyToken(parts[1]);
    req.user = decoded; // { userId, tenantId, role }
    next();
  } catch {
    return res.status(401).json({ error: "INVALID_OR_EXPIRED_TOKEN" });
  }
};
