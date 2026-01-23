const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth/login.routes"));
router.use("/docs", require("./docs/list.routes"));
router.use("/docs", require("./docs/upload.routes"));

module.exports = router;
