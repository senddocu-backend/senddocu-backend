const express = require("express");
const router = express.Router();
const redis = require("../../config/redis");
const {
  signToken,
  verifyRefreshToken,
} = require("../../utils/jwt");

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    if (!refreshToken) {
      return res.status(400).json({ error: "REFRESH_TOKEN_REQUIRED" });
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ error: "INVALID_REFRESH_TOKEN" });
    }

    const { userId, tenantId, role } = payload;

    const stored = await redis.get(`refresh:${userId}`);
    if (!stored || stored !== refreshToken) {
      return res.status(401).json({ error: "REFRESH_TOKEN_REVOKED" });
    }

    const token = signToken({ userId, tenantId, role });
    return res.json({ token });
  } catch (err) {
    console.error("REFRESH ERROR:", err);
    return res.status(500).json({ error: "REFRESH_FAILED" });
  }
});

module.exports = router;
