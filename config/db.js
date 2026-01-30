const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // HARD SAFETY LIMITS
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 15000,
  query_timeout: 15000,
});

pool.on("connect", () => {
  console.log("🟢 PostgreSQL client connected");
});

pool.on("error", (err) => {
  console.error("🔥 FATAL DB POOL ERROR:", err);
  process.exit(1);
});

// 🔒 SINGLE, STABLE INTERFACE
async function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query,
};
