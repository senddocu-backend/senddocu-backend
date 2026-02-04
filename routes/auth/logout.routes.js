const express = require("express");
const db = require("../../lib/db");
const auth = require("../../middleware/auth.middleware");

const router = express.Router();

router.post("/logout", auth, async (req, res) => {
  await db.pool.query(
    "UPDATE users SET token_version = token_version + 1 WHERE id = $1",
    [req.user.userId]
  );

  res.clearCookie("refreshToken", { path: "/auth/refresh" });
  res.json({ success: true });
});

module.exports = router;
