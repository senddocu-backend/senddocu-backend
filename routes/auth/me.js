const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { query } = require("../../config/db");

router.get("/me", auth, async (req, res) => {
  try {
    const { rows } = await query(
      `
      SELECT id, email, role, tenant_id
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    const user = rows[0];

    return res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id,
    });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).json({ error: "ME_FAILED" });
  }
});

module.exports = router;
