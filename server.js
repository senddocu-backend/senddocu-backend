require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

/* ========================
   Core middleware
======================== */
app.use(cors());
app.use(express.json());

/* ========================
   Health check
======================== */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "SendDocu",
    time: new Date().toISOString()
  });
});

/* ========================
   Routes
======================== */
app.use("/auth", require("./routes/auth/login.routes"));
app.use("/auth", require("./routes/auth/me"));

app.use("/documents", require("./routes/documents.routes"));
app.use("/envelopes", require("./routes/envelopes"));
app.use("/sign", require("./routes/sign.routes"));
app.use("/verify", require("./routes/verify.routes"));
app.use("/certificates", require("./routes/certificates.routes"));

/* ========================
   Error handler
======================== */
app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
});

/* ========================
   Start server
======================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("SERVER LISTENING ON", PORT);
});
