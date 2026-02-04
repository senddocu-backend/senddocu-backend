const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

/* =====================
   MIDDLEWARE
===================== */
app.use(cors());
app.use(express.json());

/* =====================
   STATIC FRONTEND
===================== */
app.use(express.static(path.join(__dirname, "public")));

/* =====================
   HEALTH CHECK
===================== */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "SendDocu",
    time: new Date().toISOString(),
  });
});

/* =====================
   AUTH (TEMP INLINE)
===================== */
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "NO_TOKEN" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }

  // TEMP: accept any token
  req.user = { email: "admin@senddocu.com", role: "admin" };
  next();
}

/* =====================
   AUTH ROUTES
===================== */
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    return res.json({ token: "demo-token-123" });
  }

  return res.status(401).json({ error: "INVALID_CREDENTIALS" });
});

app.get("/auth/me", auth, (req, res) => {
  res.json({
    email: req.user.email,
    role: req.user.role,
    tenantId: "SENDDOCU",
  });
});

/* =====================
   API ROUTES
===================== */
app.use("/envelopes", require("./routes/envelopes")); // ✅ SAFE NOW

app.get("/api/documents", auth, (req, res) => {
  res.json([
    {
      id: 1,
      subject: "Welcome Mail",
      recipients: "user@example.com",
      status: "SENT",
      sentAt: new Date(),
    },
    {
      id: 2,
      subject: "Invoice",
      recipients: "client@example.com",
      status: "PENDING",
      sentAt: null,
    },
  ]);
});

/* =====================
   FALLBACK (SPA)
===================== */
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

/* =====================
   START SERVER
===================== */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SendDocu backend running on port ${PORT}`);
});
