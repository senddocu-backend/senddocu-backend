const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../../config/db");
const { signToken } = require("../../utils/jwt");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      `SELECT id, email, password_hash, role, tenant_id
       FROM users
       WHERE email = $1 AND is_active = true`,
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    const token = signToken({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
    });

    res.json({
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
    res.status(500).json({ error: "LOGIN_FAILED" });
  }
});

module.exports = router;
