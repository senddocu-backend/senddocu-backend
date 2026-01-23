const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "MISSING_CREDENTIALS" });
    }

    const result = await pool.query(
      "SELECT id, email, password_hash, role, is_active FROM users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: "USER_INACTIVE" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
  console.error("========== LOGIN ERROR ==========");
  console.error(err);
  console.error(err.stack);
  console.error("JWT_SECRET:", process.env.JWT_SECRET);
  console.error("=================================");
  return res.status(500).json({ error: "SERVER_ERROR", detail: err.message });
}

};
