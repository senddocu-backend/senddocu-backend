const redis = require("../config/redis");

module.exports = async function loginRateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const key = `login:fail:${ip}`;

  try {
    const attempts = await redis.get(key);

    if (attempts && Number(attempts) >= 5) {
      return res.status(429).json({
        error: "TOO_MANY_LOGIN_ATTEMPTS",
        retryAfterSeconds: 600,
      });
    }

    return next();
  } catch (err) {
    // 🔒 FAIL-OPEN (never crash auth)
    console.error("LOGIN RATE LIMIT ERROR:", err);
    return next();
  }
};
