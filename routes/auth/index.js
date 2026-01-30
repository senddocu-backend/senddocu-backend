const express = require("express");
const router = express.Router();

const loginRoutes = require("./login.routes");

// /auth/login
router.use("/", loginRoutes);

module.exports = router;
