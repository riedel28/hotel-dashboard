import { extname } from 'node:path';

import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';

interface UploadOptions {
  maxBytes: number;
  /** Lowercase, with the dot: ['.csv', '.xlsx'] */
  extensions: string[];
}

/**
 * Accepts one file in the multipart field `file` and leaves it in memory on
 * `req.file`; the other fields land on `req.body`. Anything else is answered
 * here with `{ error, code }`.
 */
export function upload({ maxBytes, extensions }: UploadOptions) {
  const single = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes, files: 1 }
  }).single('file');

  return (req: Request, res: Response, next: NextFunction) =>
    single(req, res, (error: unknown) => {
      if (error instanceof multer.MulterError) {
        return error.code === 'LIMIT_FILE_SIZE'
          ? res
              .status(413)
              .json({ error: 'File is too large', code: 'FILE_TOO_LARGE' })
          : res
              .status(400)
              .json({ error: 'Invalid upload', code: 'FILE_REQUIRED' });
      }
      if (error) {
        return next(error);
      }
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'No file uploaded', code: 'FILE_REQUIRED' });
      }
      if (!extensions.includes(extname(req.file.originalname).toLowerCase())) {
        return res
          .status(400)
          .json({ error: 'Unsupported file type', code: 'UNSUPPORTED_FILE' });
      }
      next();
    });
}
