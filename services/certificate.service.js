const QRCode = require("qrcode");
const db = require("../config/db");

/**
 * Builds authoritative certificate data for an envelope.
 * READ-ONLY. CRYPTOGRAPHICALLY VERIFIED.
 */
async function buildCertificateData(envelopeId) {
  // 1️⃣ Envelope must exist and be completed
  const { rows: envelopes } = await db.query(
    `SELECT id, status, sent_at, completed_at
     FROM envelopes
     WHERE id = $1`,
    [envelopeId]
  );

  if (!envelopes.length) {
    throw new Error("ENVELOPE_NOT_FOUND");
  }

  const envelope = envelopes[0];

  if (envelope.status !== "completed") {
    throw new Error("ENVELOPE_NOT_COMPLETED");
  }

  // 2️⃣ Snapshot must exist
  const { rows: snapshots } = await db.query(
    `SELECT snapshot_hash
     FROM envelope_snapshots
     WHERE envelope_id = $1`,
    [envelopeId]
  );

  if (!snapshots.length) {
    throw new Error("SNAPSHOT_MISSING");
  }

  const snapshotHash = snapshots[0].snapshot_hash;

  // 3️⃣ Recompute snapshot and compare (anti-tamper)
  const { rows: recomputed } = await db.query(
    `SELECT compute_envelope_snapshot_hash($1) AS hash`,
    [envelopeId]
  );

  if (recomputed[0].hash !== snapshotHash) {
    throw new Error("INTEGRITY_FAILED");
  }

  // 4️⃣ Documents
  const { rows: documents } = await db.query(
    `SELECT original_filename, file_hash, hash_algo
     FROM documents
     WHERE envelope_id = $1`,
    [envelopeId]
  );

  // 5️⃣ Recipients
  const { rows: recipients } = await db.query(
    `SELECT email, signed_at
     FROM recipients
     WHERE envelope_id = $1`,
    [envelopeId]
  );

  // 6️⃣ Verification URL + QR
  const publicBase = process.env.PUBLIC_BASE_URL || "";
  const verifyUrl = `${publicBase}/verify.html?envelope=${envelopeId}`;
  const qr = await QRCode.toDataURL(verifyUrl);

  return {
    envelope,
    snapshot_hash: snapshotHash,
    documents,
    recipients,
    verifyUrl,
    qr
  };
}

module.exports = {
  buildCertificateData
};
