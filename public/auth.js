// public/auth.js

const TOKEN_KEY = "token";

/**
 * Require authentication for protected pages
 */
async function requireAuth() {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    window.location.replace("/login.html");
    return;
  }

  try {
    const res = await fetch("/auth/me", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) throw new Error("Invalid token");

    return await res.json();
  } catch (err) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.replace("/login.html");
  }
}

/**
 * Prevent logged-in users from seeing login/register pages
 */
async function preventAuthPages() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;

  try {
    const res = await fetch("/auth/me", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (res.ok) {
      window.location.replace("/dashboard.html");
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Logout everywhere
 */
function doLogout() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.clear();
  window.location.replace("/login.html");
}
