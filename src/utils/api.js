const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export async function recognizeWord(strokes) {
  const response = await fetch(`${API_BASE}/recognize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ strokes }),
  });

  if (!response.ok) {
    throw new Error(`Recognition failed with status ${response.status}`);
  }

  return response.json();
}

export async function exportWorkspaceWithBackend(payload) {
  const response = await fetch(`${API_BASE}/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Export failed with status ${response.status}`);
  }

  return response.json();
}
