const express = require("express");
const db = require("../../lib/db");
const {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken
} = require("../../utils/jwt");

const router = express.Router();

router.post("/refresh", async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ error: "NO_REFRESH_TOKEN" });
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ error: "INVALID_REFRESH_TOKEN" });
  }

  const userRes = await db.pool.query(
    "SELECT * FROM users WHERE id = $1",
    [payload.userId]
  );

  const user = userRes.rows[0];
  if (!user || user.token_version !== payload.tokenVersion) {
    return res.status(401).json({ error: "SESSION_REVOKED" });
  }

  const newAccess = signAccessToken(user);
  const newRefresh = signRefreshToken(user);

  res.cookie("refreshToken", newRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/auth/refresh",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.json({ token: newAccess });
});

module.exports = router;
