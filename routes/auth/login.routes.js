const express = require("express");
const bcrypt = require("bcrypt");
const { getPool } = require("../../lib/db");
const { signToken } = require("../../utils/jwt");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const pool = getPool("default");

    const { rows } = await pool.query(
      "SELECT id, email, password_hash, tenant_id, role FROM users WHERE email=$1",
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "LOGIN_FAILED" });
    }

    const user = rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "LOGIN_FAILED" });
    }

    const token = signToken({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role
    });

    return res.json({ token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "LOGIN_FAILED" });
  }
});

module.exports = router;
