import type { NextFunction, Request, Response } from 'express';
import { ZodError, ZodObject, type ZodType } from 'zod';

// Validate request body. Any schema: a body can be a union of objects too.
function validateBody(schema: ZodType) {
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
function validateParams(schema: ZodObject<any>) {
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
function validateQuery(schema: ZodObject<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.query);

      // Express 5 exposes req.query as a read-only getter that returns a fresh
      // object on each access — replace it with the coerced Zod output.
      Object.defineProperty(req, 'query', {
        value: validatedData,
        writable: true,
        configurable: true,
        enumerable: true
      });
      // Typed handlers read it here: req.query stays typed as raw strings
      res.locals.query = validatedData;

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
