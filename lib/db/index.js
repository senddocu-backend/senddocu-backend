// lib/db/index.js
const { Pool } = require("pg");

const pools = {};

function getPool(region = "default") {
  if (!pools[region]) {
    pools[region] = new Pool({
      connectionString:
        process.env[`DATABASE_URL_${region.toUpperCase()}`] ||
        process.env.DATABASE_URL
    });
  }
  return pools[region];
}

async function query(text, params = [], region = "default") {
  const pool = getPool(region);
  return pool.query(text, params);
}

module.exports = {
  query,
  getPool
};
