// http://localhost:3000
// https://api-krajanka.up.railway.app

const API_URL = "http://localhost:3000";

export default async function fetcher(endpoint, method = "GET", body = null) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
    credentials: "include",
  });
  let data;
  try {
    data = await response.json();
  } catch {
    data = { ok: false, message: "Serwer zwrócił nieprawidłową odpowiedź." };
  }
  if (!response.ok || !data.ok) {
    const error = new Error(data.message || "Nie udało się wykonać żądania.");
    error.status = response.status;
    error.code = data.code;
    error.result = data.result;
    throw error;
  }
  return data.result ?? data.message;
}
