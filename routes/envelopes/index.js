const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth.middleware");

// Apply auth once
router.use(auth);

// Health / sanity
router.get("/", (req, res) => {
  res.json({ message: "Envelopes root working" });
});

// IMPORTANT: mount ALL envelope subroutes at root
router.use("/", require("./send.routes"));
router.use("/", require("./recipients.routes"));
router.use("/", require("./documents.routes"));

module.exports = router;
