const jwt = require("jsonwebtoken");

module.exports = function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "INVALID_AUTH_HEADER" });
    }

    const token = header.split(" ")[1];

    const payload = verifyToken(token); // your jwt util
    req.user = payload;

    next();
  } catch (err) {
    console.error("JWT VERIFY FAILED:", err.message);
    return res.status(401).json({ error: "INVALID_OR_EXPIRED_TOKEN" });
  }
};
