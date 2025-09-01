import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

// Validate request body
function validateBody<T = unknown>(schema: { parse: (data: unknown) => T }) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate request body
      const validatedData = schema.parse(req.body);

      // Replace req.body with validated data
      req.body = validatedData;

      next(); // Validation passed, continue
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error); // Unexpected error, pass to error handler
    }
  };
}

// Validate URL parameters
function validateParams<T = unknown>(schema: { parse: (data: unknown) => T }) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Invalid parameters',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
}

// Validate query parameters
function validateQuery<T = unknown>(schema: { parse: (data: unknown) => T }) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
}

export { validateBody, validateParams, validateQuery };
