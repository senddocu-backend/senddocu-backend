const loginAttempts = new Map();

const MAX_ATTEMPTS_PER_MIN = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

module.exports = function loginGuard(req, res, next) {
  const { email } = req.body;
  const ip = req.ip;

  if (!email) return next();

  const key = `${ip}:${email}`;
  const now = Date.now();

  const record = loginAttempts.get(key) || {
    count: 0,
    firstAttempt: now,
    lockedUntil: null,
  };

  // If locked
  if (record.lockedUntil && record.lockedUntil > now) {
    return res.status(429).json({
      error: "ACCOUNT_TEMPORARILY_LOCKED",
      retryAfterSeconds: Math.ceil(
        (record.lockedUntil - now) / 1000
      ),
    });
  }

  // Reset window after 1 minute
  if (now - record.firstAttempt > 60_000) {
    record.count = 0;
    record.firstAttempt = now;
    record.lockedUntil = null;
  }

  record.count++;

  // Lock if exceeded
  if (record.count > MAX_ATTEMPTS_PER_MIN) {
    record.lockedUntil = now + LOCK_TIME_MS;
    loginAttempts.set(key, record);

    return res.status(429).json({
      error: "TOO_MANY_LOGIN_ATTEMPTS",
    });
  }

  loginAttempts.set(key, record);
  next();
};
