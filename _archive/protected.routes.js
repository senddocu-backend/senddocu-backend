const express = require("express");
const authMiddleware = require("../utils/authMiddleware");

const router = express.Router();

router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});

module.exports = router;
