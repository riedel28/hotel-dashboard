import { extname } from 'node:path';

import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';

import type { UploadError } from '../../../shared/types/uploads';

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

  return (req: Request, res: Response, next: NextFunction) => {
    const refuse = (status: number, code: UploadError, error: string) =>
      res.status(status).json({ error, code });

    single(req, res, (error: unknown) => {
      if (error instanceof multer.MulterError) {
        return error.code === 'LIMIT_FILE_SIZE'
          ? refuse(413, 'FILE_TOO_LARGE', 'File is too large')
          : refuse(400, 'INVALID_UPLOAD', 'Send one file in the field "file"');
      }
      if (error) {
        return next(error);
      }
      if (!req.file) {
        return refuse(400, 'FILE_REQUIRED', 'No file uploaded');
      }
      if (!extensions.includes(extname(req.file.originalname).toLowerCase())) {
        return refuse(400, 'UNSUPPORTED_FILE', 'Unsupported file type');
      }
      next();
    });
  };
}
