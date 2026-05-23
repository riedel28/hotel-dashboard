const API_URL = 'http://localhost:5001/api';

export async function resetDatabase() {
  const res = await fetch(`${API_URL}/test/reset`, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`DB reset failed: ${res.status} ${await res.text()}`);
  }
}
