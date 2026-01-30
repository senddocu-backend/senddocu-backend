const TOKEN_KEY = "token";

async function loadMailGrid() {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    window.location.replace("/login.html");
    return;
  }

  try {
    const res = await fetch("/documents", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) throw new Error("Unauthorized");

    const json = await res.json();
    const documents = json.data || [];

    const tbody = document.getElementById("mailGridBody");
    tbody.innerHTML = "";

    if (documents.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">No documents found</td></tr>`;
      return;
    }

    documents.forEach(doc => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${doc.id}</td>
        <td>${doc.subject || "-"}</td>
        <td>${doc.recipients || "-"}</td>
        <td>${doc.status}</td>
        <td>${doc.created_at}</td>
        <td>
          <a href="/documents/download/${doc.id}" target="_blank">Download</a>
        </td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("MailGrid error:", err);
    localStorage.removeItem(TOKEN_KEY);
    window.location.replace("/login.html");
  }
}

document.addEventListener("DOMContentLoaded", loadMailGrid);
