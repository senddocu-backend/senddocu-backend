const express = require("express");
const router = express.Router();

router.use("/", require("./envelopes.routes"));
router.use("/", require("./recipients.routes"));
router.use("/", require("./send.routes"));

module.exports = router;
