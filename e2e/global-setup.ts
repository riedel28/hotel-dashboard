import { resetDatabase } from './helpers/reset-db';

const API_URL = 'http://localhost:5001/api';

async function globalSetup() {
  console.log('Waiting for backend to be ready...');

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
  await resetDatabase();
  console.log('Database seeded successfully.');
}

export default globalSetup;
