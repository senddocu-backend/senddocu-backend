const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/:hash", async (req, res) => {
  const { hash } = req.params;

  try {
    const result = await db.query(
      `SELECT
         ec.envelope_id,
         ec.certificate_hash,
         ec.certificate_data,
         ec.generated_at
       FROM envelope_certificates ec
       WHERE ec.certificate_hash = $1`,
      [hash]
    );

    if (!result.rows.length) {
      return res.status(404).json({ verified: false });
    }

    return res.json({
      verified: true,
      certificate: result.rows[0],
    });
  } catch (err) {
    console.error("CERTIFICATE READ ERROR:", err);
    return res.status(500).json({ error: "CERTIFICATE_READ_FAILED" });
  }
});

module.exports = router;
