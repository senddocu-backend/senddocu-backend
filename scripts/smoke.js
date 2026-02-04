// scripts/smoke.js
const fetch = global.fetch;

const HEALTH_URL = "http://127.0.0.1:3000/health";
const MAX_RETRIES = 10;
const DELAY_MS = 1000;

(async () => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(HEALTH_URL);
      if (!res.ok) throw new Error(`Status ${res.status}`);

      const data = await res.json();
      if (data.status !== "ok") throw new Error("Health not OK");

      console.log("🎉 SMOKE TEST PASSED");
      process.exit(0);
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        console.error("❌ SMOKE TEST FAILED:", err.message);
        process.exit(1);
      }
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }
})();
