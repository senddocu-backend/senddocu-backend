require("dotenv").config();

function fail(msg) {
  console.error("❌ PREFLIGHT FAILED:", msg);
  process.exit(1);
}

const REQUIRED_ENVS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "REDIS_URL"
];

for (const key of REQUIRED_ENVS) {
  if (!process.env[key]) {
    fail(`${key} is missing`);
  }
}

console.log("✅ ENV variables OK");
