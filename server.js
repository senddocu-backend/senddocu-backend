/*************************
 * 0️⃣ HARD FAIL SAFETY
 *************************/
process.on("unhandledRejection", err => {
  console.error("UNHANDLED REJECTION", err);
  process.exit(1);
});

process.on("uncaughtException", err => {
  console.error("UNCAUGHT EXCEPTION", err);
  process.exit(1);
});

/*************************
 * 1️⃣ ENV FIRST
 *************************/
console.log("BOOT 1: loading env");
require("dotenv").config();
console.log("BOOT 2: env loaded");

/*************************
 * 2️⃣ Imports (NO SIDE EFFECTS)
 *************************/
console.log("BOOT 3: loading imports");

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const { randomUUID } = require("crypto");

const { getPool } = require("./lib/db");
const redis = require("./lib/redis");

console.log("BOOT 4: imports loaded");

/*************************
 * 3️⃣ App init
 *************************/
const app = express();

/*************************
 * 4️⃣ Core middleware
 *************************/
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.id = randomUUID();
  next();
});

app.use(morgan(":method :url :status :response-time ms"));

/*************************
 * 5️⃣ Health Check (NON-BLOCKING)
 *************************/
app.get("/health", async (_req, res) => {
  try {
    const pool = getPool("default");
    await pool.query("SELECT 1");

    if (redis?.ping) {
      await redis.ping();
    }

    res.json({
      status: "ok",
      uptime: process.uptime(),
      db: "connected",
      redis: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("HEALTH FAILED:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

console.log("BOOT 5: health ready");

/*************************
 * 6️⃣ API Routes
 *************************/
console.log("BOOT 6: loading routes");

app.use("/auth", require("./routes/auth"));
app.use("/envelopes", require("./routes/envelopes"));
app.use("/documents", require("./routes/documents.routes"));
app.use("/sign", require("./routes/sign.routes"));
app.use("/verify", require("./routes/verify.routes"));
app.use("/certificates", require("./routes/certificates.routes"));

console.log("BOOT 7: routes loaded");

/*************************
 * 7️⃣ Static Frontend
 *************************/
app.use(express.static(path.join(__dirname, "public")));

/*************************
 * 8️⃣ Frontend Fallback
 *************************/
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

/*************************
 * 9️⃣ Start Server (LAST)
 *************************/
const PORT = Number(process.env.PORT) || 3000;

console.log("BOOT 8: starting listener on", PORT);

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 SERVER LISTENING ON", PORT);
});
