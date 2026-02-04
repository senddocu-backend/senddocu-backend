const express = require("express");

const router = express.Router();

router.use(require("./login.routes"));
router.use(require("./me.routes"));

module.exports = router;
