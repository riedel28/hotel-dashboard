import { Router } from 'express';
import seed from '../scripts/seed';

const router = Router();

router.post('/reset', async (_req, res) => {
  try {
    await seed();
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Test reset failed:', error);
    res.status(500).json({ error: 'Reset failed' });
  }
});

export default router;
