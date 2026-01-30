const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                 // 10 login attempts
  message: {
    error: "LOGIN_RATE_LIMIT_EXCEEDED",
    retryAfterMinutes: 15
  }
});
