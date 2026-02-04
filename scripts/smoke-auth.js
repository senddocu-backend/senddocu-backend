const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

(async () => {
  const base = "http://127.0.0.1:3000";

  // Health
  const h = await fetch(`${base}/health`);
  if (!h.ok) throw new Error("Health failed");

  // Login
  const login = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@senddocu.com",
      password: "test123"
    })
  });
  const l = await login.json();
  if (!l.token) throw new Error("Login failed");

  // Me
  const me = await fetch(`${base}/auth/me`, {
    headers: { Authorization: `Bearer ${l.token}` }
  });
  const m = await me.json();
  if (!m.userId || !m.tenantId) throw new Error("Auth/me failed");

  console.log("✅ AUTH SMOKE PASSED");
})().catch(err => {
  console.error("❌ AUTH SMOKE FAILED:", err.message);
  process.exit(1);
});
