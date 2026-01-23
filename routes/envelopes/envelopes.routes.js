const express = require("express");
const router = express.Router();
const db = require("../../config/db");

router.post("/", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const userId = req.user.userId;
    const tenantId = req.user.tenantId ?? 1;

    console.log("AUTH USER:", req.user);
    console.log("INSERTING ENVELOPE:", { tenantId, userId });

    const result = await db.query(
      `
      INSERT INTO envelopes (tenant_id, created_by)
      VALUES ($1, $2)
      RETURNING id, status, created_at
      `,
      [tenantId, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("ENVELOPE CREATE ERROR:", err);
    res.status(500).json({
      error: "ENVELOPE_CREATE_FAILED",
      detail: err.message,
    });
  }
});

module.exports = router;
