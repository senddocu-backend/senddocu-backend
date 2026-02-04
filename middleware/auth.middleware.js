const { verifyToken } = require("../utils/jwt");

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "INVALID_AUTH_HEADER" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role
    };

    next();
  } catch (err) {
    console.error("JWT VERIFY FAILED:", err.message);
    return res.status(401).json({ error: "INVALID_OR_EXPIRED_TOKEN" });
  }
};
