export function escapeLikePattern(value: string): string {
  return value.replace(/[%_\\]/g, '\\$&');
}

/** True for a Postgres unique-constraint violation, raw or wrapped by Drizzle. */
export function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } } | null;
  return e?.code === '23505' || e?.cause?.code === '23505';
}
