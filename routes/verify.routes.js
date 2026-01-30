const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/:hash", async (req, res) => {
  try {
    const { hash } = req.params;

    const result = await db.query(
      `SELECT certificate_hash
       FROM envelope_certificates
       WHERE certificate_hash = $1`,
      [hash]
    );

    if (result.rows.length === 0) {
      return res.json({ verified: false });
    }

    return res.json({ verified: true });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({ verified: false });
  }
});

module.exports = router;
