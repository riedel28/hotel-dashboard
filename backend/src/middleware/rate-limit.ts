import type { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';

import env from '../../env';

/**
 * The stricter limit for routes that check a secret (passwords, device PINs),
 * against guessing. Each call returns a limiter with its own counters, so one
 * route group does not use up another's attempts. Disabled in the test
 * environment, like the general limiter.
 */
export function createStrictRateLimiter(): RequestHandler {
  if (env.NODE_ENV === 'test') {
    return (_req, _res, next) => next();
  }
  return rateLimit({
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    max: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: 'draft-8',
    legacyHeaders: false
  });
}
