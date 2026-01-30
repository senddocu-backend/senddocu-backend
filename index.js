const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

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
   AUTH MIDDLEWARE
===================== */
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Invalid token" });

  // TEMP: accept any token (can plug JWT later)
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

  res.status(401).json({ error: "Invalid credentials" });
});

app.get("/auth/me", auth, (req, res) => {
  res.json({
    email: req.user.email,
    role: req.user.role,
    tenantId: "SENDDOCU"
  });
});

/* =====================
   DOCUMENTS API
===================== */
app.get("/api/documents", auth, (req, res) => {
  res.json([
    {
      id: 1,
      subject: "Welcome Mail",
      recipients: "user@example.com",
      status: "SENT",
      sentAt: new Date()
    },
    {
      id: 2,
      subject: "Invoice",
      recipients: "client@example.com",
      status: "PENDING",
      sentAt: null
    }
  ]);
});

/* =====================
   FALLBACK
===================== */
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

/* =====================
   START SERVER
===================== */
app.listen(PORT, () => {
  console.log(`SendDocu backend running on port ${PORT}`);
});
