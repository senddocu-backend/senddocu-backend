const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => {
  console.log("🟢 PostgreSQL connected");
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
