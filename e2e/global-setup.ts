const API_URL = 'http://localhost:5001/api';

async function globalSetup() {
  console.log('Waiting for backend to be ready...');

  // Wait for backend health check
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) break;
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log('Resetting database to seed state...');

  const res = await fetch(`${API_URL}/test/reset`, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`DB reset failed: ${res.status} ${await res.text()}`);
  }

  console.log('Database seeded successfully.');
}

export default globalSetup;
