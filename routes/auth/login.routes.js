const express = require("express");
const router = express.Router();

const { query } = require("../../config/db");
const bcrypt = require("bcrypt");
const { signToken } = require("../../utils/jwt");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      `
      SELECT id, email, password_hash, role, tenant_id
      FROM users
      WHERE email = $1 AND is_active = true
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    const user = result.rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    const token = signToken({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
    });

    return res.json({
      token,
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
