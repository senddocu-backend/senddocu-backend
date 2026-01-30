const express = require("express");
const router = express.Router();

// Mount recipient signing routes
router.use(require("./sign.routes"));

module.exports = router;
