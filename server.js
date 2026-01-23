require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth/login.routes");
const envelopeRoutes = require("./routes/envelopes");

const app = express();

// ─────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ─────────────────────────────────────────
// Routes
// ─────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/envelopes", envelopeRoutes);
app.use("/envelopes", require("./routes/envelopes"));

// Health check (VERY IMPORTANT)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ─────────────────────────────────────────
// Start server
// ─────────────────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`SendDocu backend running on port ${PORT}`);
});
