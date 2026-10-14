import type { NextFunction, Request, Response } from 'express';

import env from '../../env.ts';

// Postgres error code.
const foreignKeyViolation = '23503';

export interface CustomError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error(err.stack);

  // Default error
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation Error';
  }

  if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  }

  if (err.code === '23505') {
    // PostgreSQL unique violation
    status = 409;
    message = 'Resource already exists';
  }

  if (err.code === foreignKeyViolation) {
    // PostgreSQL foreign key violation
    status = 400;
    message = 'Invalid reference';
  }

  res.status(status).json({
    error: message,
    ...(env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.message
    })
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not found - ${req.originalUrl}`) as CustomError;
  error.status = 404;
  next(error);
};

// Whether a database error is a Postgres foreign_key_violation. Drizzle wraps
// the driver's error, so the code may sit on `cause`.
export function isForeignKeyViolation(error: unknown) {
  const { code, cause } = error as { code?: string; cause?: { code?: string } };
  return (code ?? cause?.code) === foreignKeyViolation;
}

// An expected failure with its own status (and optional machine-readable
// code), thrown from anywhere in a handler wrapped by withFailMessage — out
// of a transaction too, which then rolls back.
export class HttpProblem extends Error {
  readonly status: number;
  readonly code: string | undefined;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Wraps a route handler so an unexpected error is logged and answered with a
// 500 carrying `failMessage` — the per-operation message controllers
// otherwise repeat in a try/catch of their own. An HttpProblem is answered
// as it says.
export function withFailMessage<Req extends Request = Request>(
  failMessage: string,
  handler: (req: Req, res: Response) => Promise<unknown>
) {
  return async (req: Req, res: Response) => {
    try {
      await handler(req, res);
    } catch (error) {
      if (error instanceof HttpProblem) {
        res
          .status(error.status)
          .json({ error: error.message, code: error.code });
        return;
      }
      console.error(error);
      res.status(500).json({ error: failMessage });
    }
  };
}
