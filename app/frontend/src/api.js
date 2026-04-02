const API_BASE = "http://localhost:8000/api";

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function processDocument(storagePath, docId, userId) {
  const res = await fetch(`${API_BASE}/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storage_path: storagePath, doc_id: docId, user_id: userId })
  });
  return res.json();
}

export async function chatWithDocument(docId, query) {
  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doc_id: docId, query: query })
  });
  return res.json();
}
