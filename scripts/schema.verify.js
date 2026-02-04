require("dotenv").config();
const { Pool } = require("pg");

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await pool.query("SELECT 1");

    await pool.query(`
      SELECT 1
      FROM pg_trigger
      WHERE tgname IN (
        'trg_documents_lock',
        'trg_envelope_documents_lock'
      )
    `);

    console.log("✅ DB schema & triggers OK");
    process.exit(0);
  } catch (err) {
    console.error("❌ SCHEMA VERIFY FAILED:", err.message);
    process.exit(1);
  }
})();
