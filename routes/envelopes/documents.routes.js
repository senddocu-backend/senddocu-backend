const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const auth = require("../../middleware/auth.middleware");
const db = require("../../lib/db");

router.post("/:envelopeId/documents", auth, async (req, res) => {
  const { envelopeId } = req.params;
  const { documents } = req.body;

  if (!Array.isArray(documents) || documents.length === 0) {
    return res.status(400).json({ error: "DOCUMENTS_REQUIRED" });
  }

  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    // ✅ Check envelope status INSIDE async handler
    const envRes = await client.query(
      `SELECT status FROM envelopes WHERE id = $1`,
      [envelopeId]
    );

    if (envRes.rowCount === 0) {
      throw new Error("ENVELOPE_NOT_FOUND");
    }

    if (envRes.rows[0].status === "completed") {
      return res.status(409).json({
        error: "ENVELOPE_COMPLETED",
        message: "Cannot add documents to a completed envelope"
      });
    }

    const results = [];

    for (let i = 0; i < documents.length; i++) {
      const d = documents[i];

      const storedFilename =
        crypto.randomUUID() + "-" + d.original_name;

      const fileHash = crypto
        .createHash("sha256")
        .update(`${d.original_name}:${d.file_size}:${Date.now()}`)
        .digest("hex");

      const docRes = await client.query(
        `
        INSERT INTO documents (
          stored_filename,
          original_filename,
          uploaded_by,
          file_hash,
          tenant_id,
          original_name,
          mime_type,
          storage_path,
          file_size
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING id
        `,
        [
          storedFilename,
          d.original_name,
          req.user.userId,
          fileHash,
          req.user.tenantId,
          d.original_name,
          d.mime_type,
          d.storage_path,
          d.file_size
        ]
      );

      const documentId = docRes.rows[0].id;

      await client.query(
        `
        INSERT INTO envelope_documents
          (envelope_id, document_id, position)
        VALUES ($1, $2, $3)
        `,
        [envelopeId, documentId, i + 1]
      );

      results.push({ document_id: documentId });
    }

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      documents: results
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("DOCUMENT INSERT FAILED:", err.message);
    return res.status(500).json({ error: "CREATE_DOCUMENT_FAILED" });
  } finally {
    client.release();
  }
});

module.exports = router;
