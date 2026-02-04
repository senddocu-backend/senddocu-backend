const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

module.exports = async function () {
  try {
    execSync("node -c routes/**/*.js", { stdio: "ignore" });
    console.log("✅ Route integrity check passed");
  } catch (err) {
    console.error("❌ Route integrity FAILED");
    process.exit(1);
  }
};
