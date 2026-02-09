import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
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
import verificationRouter from './routes/verification';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: 'draft-8',
  legacyHeaders: false
});
app.use(generalLimiter);

app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
if (env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Stricter rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: 'draft-8',
  legacyHeaders: false
});
app.use('/api/auth', authLimiter, verificationRouter);
app.use('/api/auth', authLimiter, authRouter);
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
