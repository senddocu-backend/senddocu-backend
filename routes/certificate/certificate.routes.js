const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const generateCertificatePDF = require("../../services/certificate.pdf");

router.get("/:envelopeId", async (req, res) => {
  try {
    const envelopeId = parseInt(req.params.envelopeId, 10);
    if (Number.isNaN(envelopeId)) {
      return res.status(400).json({ error: "INVALID_ENVELOPE_ID" });
    }

    // 1️⃣ Fetch envelope + snapshot
    const { rows } = await pool.query(
      `
      SELECT
        e.id,
        e.status,
        e.completed_at,
        s.snapshot_hash
      FROM envelopes e
      JOIN envelope_snapshots s ON s.envelope_id = e.id
      WHERE e.id = $1::INTEGER
        AND e.status = 'completed'
      `,
      [envelopeId]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        error: "CERTIFICATE_FAILED",
        reason: "Envelope not completed or snapshot missing",
      });
    }

    const envelope = rows[0];

    // 2️⃣ Generate certificate hash
    const { rows: hashRows } = await pool.query(
      `
      SELECT encode(
        digest(snapshot_hash || 'CERTIFICATE', 'sha256'),
        'hex'
      ) AS certificate_hash
      FROM envelope_snapshots
      WHERE envelope_id = $1::INTEGER
      `,
      [envelopeId]
    );

    const certificateHash = hashRows[0].certificate_hash;

    // 3️⃣ If browser → return PDF
    if (req.headers.accept && req.headers.accept.includes("application/pdf")) {
      return generateCertificatePDF(res, {
        envelopeId,
        snapshotHash: envelope.snapshot_hash,
        certificateHash,
        completedAt: envelope.completed_at,
      });
    }

    // 4️⃣ Default → JSON
    res.json({
      envelope_id: envelopeId,
      status: "CERTIFIED",
      certificate_hash: certificateHash,
      snapshot_hash: envelope.snapshot_hash,
      completed_at: envelope.completed_at,
    });
  } catch (err) {
    console.error("CERTIFICATE ROUTE ERROR:", err);
    res.status(500).json({
      error: "CERTIFICATE_FAILED",
      reason: err.message,
    });
  }
});

module.exports = router;
