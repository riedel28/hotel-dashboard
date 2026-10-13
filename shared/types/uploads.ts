// What the upload middleware answers with when it refuses a request
export type UploadError =
  | 'FILE_REQUIRED'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FILE'
  // Not one file in the field `file`
  | 'INVALID_UPLOAD';
