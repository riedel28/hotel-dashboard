import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import env from '../env';
import { errorHandler, notFound } from './middleware/error';
import authRouter from './routes/auth';
import monitoringRouter from './routes/monitoring';
import propertiesRouter from './routes/properties';
import reservationsRouter from './routes/reservations';
import rolesRouter from './routes/roles';
import roomsRouter from './routes/rooms';
import usersRouter from './routes/users';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/monitoring', monitoringRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/users', usersRouter);

// 404 handler - MUST come after all valid routes
app.use(notFound);

// Global error handler - MUST be last
app.use(errorHandler);

export default app;
