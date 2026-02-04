/**
 * PostgreSQL Pool Configuration
 * Single source of truth for DB access
 */

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // HARD SAFETY LIMITS
  max: 20,                     // max clients in pool
  idleTimeoutMillis: 30000,    // close idle clients after 30s
  connectionTimeoutMillis: 5000,
  statement_timeout: 15000,
  query_timeout: 15000,
});

/**
 * Pool lifecycle logging
 */
pool.on("connect", () => {
  console.log("🟢 PostgreSQL client connecte as", process.env.DB_USER);
});

pool.on("error", (err) => {
  console.error("🔥 FATAL DB POOL ERROR:", err);
  process.exit(1);
});

/**
 * Optional helper (recommended)
 */
async function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query,
};
