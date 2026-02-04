const fetch = require("node-fetch");

(async () => {
  try {
    const res = await fetch("http://127.0.0.1:3000/health");

    if (!res.ok) {
      throw new Error(`Health failed with status ${res.status}`);
    }

    const data = await res.json();

    if (data.status !== "ok") {
      throw new Error("Health response not OK");
    }

    console.log("🎉 SMOKE TEST PASSED");
    process.exit(0);
  } catch (err) {
    console.error("❌ SMOKE TEST FAILED:", err.message);
    process.exit(1);
  }
})();
