import cors from 'cors';
import express from 'express';

import authRouter from './routes/auth';
import reservationsRouter from './routes/reservations';

const app = express();

app.disable('x-powered-by');
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  })
);

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/reservations', reservationsRouter);

// Basic 404
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found' } });
});

export default app;
