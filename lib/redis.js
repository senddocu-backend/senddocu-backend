const Redis = require("ioredis");

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined");
}

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
  console.log("REDIS CONNECTED");
});

redis.on("error", (err) => {
  console.error("REDIS ERROR:", err.message);
});

module.exports = redis;
