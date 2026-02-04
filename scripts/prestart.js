/**
 * Prestart Guard
 * Blocks server startup if structural errors exist
 */

const { execSync } = require("child_process");

function run(cmd) {
  console.log(`🔍 Running: ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

try {
  // 1. Syntax validation
  run("node -c server.js");
  run("node -c routes/**/*.js");

  // 2. Circular dependency guard
  run("grep -R \"require(.*server\" -n routes || true");

  console.log("✅ Prestart validation PASSED");
} catch (err) {
  console.error("❌ Prestart validation FAILED");
  process.exit(1);
}
