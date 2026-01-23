const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const authMiddleware = require("../../middleware/auth");

// 🔒 APPLY AUTH AT ROUTER LEVEL (CRITICAL)
router.use(authMiddleware);


/**
 * POST /envelopes/:id/recipients
 */
router.post("/:id/recipients", async (req, res) => {
  // 🔒 ABSOLUTE GUARD — MUST BE FIRST
  if (!req.user) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  const envelopeId = Number(req.params.id);
  const { recipients } = req.body;

  // ✅ SAFE access AFTER guard
  const tenantId = req.user.tenantId;
  const userId = req.user.userId;

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: "RECIPIENTS_REQUIRED" });
  }

  try {
    // 1️⃣ Validate envelope
    const env = await db.query(
      `SELECT id, status
       FROM envelopes
       WHERE id = $1 AND tenant_id = $2`,
      [envelopeId, tenantId]
    );

    if (!env.rows.length) {
      return res.status(404).json({ error: "ENVELOPE_NOT_FOUND" });
    }

    if (env.rows[0].status !== "draft") {
      return res.status(400).json({ error: "ENVELOPE_NOT_EDITABLE" });
    }

    // 2️⃣ Insert recipients
    const inserted = [];

    for (const r of recipients) {
      const result = await db.query(
        `INSERT INTO recipients
         (envelope_id, name, email, role, signing_order)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, role, signing_order, status`,
        [
          envelopeId,
          r.name,
          r.email,
          r.role || "signer",
          r.signingOrder || 1,
        ]
      );

      inserted.push(result.rows[0]);
    }

    return res.status(201).json({
      envelopeId,
      recipients: inserted,
    });
  } catch (err) {
    console.error("RECIPIENT INSERT ERROR:", err);
    return res.status(500).json({
      error: "FAILED_TO_ADD_RECIPIENTS",
      detail: err.message,
    });
  }
});

module.exports = router;
