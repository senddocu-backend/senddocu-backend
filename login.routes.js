const express = require("express");
const router = express.Router();

const { query } = require("../../config/db");
const redis = require("../../config/redis");
const bcrypt = require("bcrypt");
const audit = require("../../utils/audit");

const {
  signToken,
  signRefreshToken,
} = require("../../utils/jwt");

const loginRateLimit = require("../../middleware/loginRateLimit");

/* ✅ NOTHING ASYNC ABOVE THIS LINE */

router.post("/login", loginRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip;
    const failKey = `login:fail:${ip}`;

    const result = await query(
      `
      SELECT id, email, password_hash, role, tenant_id
      FROM users
      WHERE email = $1 AND is_active = true
      `,
      [email]
    );

    if (result.rows.length === 0) {
      await redis.incr(failKey);
      await redis.expire(failKey, 600);
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      await redis.incr(failKey);
      await redis.expire(failKey, 600);
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    await redis.del(failKey);

    const token = signToken({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
    });

    await redis.set(
      `refresh:${user.id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60
    );

    // ✅ AUDIT LOG (NON-BLOCKING, SAFE)
    audit({
      tenantId: user.tenant_id,
      actorUserId: user.id,
      actorRole: user.role,
      entityType: "auth",
      action: "LOGIN",
      req,
    }).catch(err => {
      console.error("AUDIT LOGIN FAILED:", err);
    });

    return res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "LOGIN_FAILED" });
  }
});

module.exports = router;
