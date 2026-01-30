const express = require("express");
const router = express.Router();
const db = require("../../config/db");

router.get("/", async (req, res) => {
  const tenantId = req.user.tenantId;

  const result = await db.query(
    `SELECT id, status, created_at, sent_at, completed_at
     FROM envelopes
     WHERE tenant_id = $1
     ORDER BY id DESC`,
    [tenantId]
  );

  res.json({
    count: result.rowCount,
    envelopes: result.rows,
  });
});

module.exports = router;
