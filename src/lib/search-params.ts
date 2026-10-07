import { z } from 'zod';

// Any origin works: the question is only whether resolving the path leaves it.
const PROBE_ORIGIN = 'http://in-app.invalid';

/**
 * True when `path` stays inside the app. Resolved the way a browser would, so
 * `//host`, `/\host` and paths with embedded tabs or newlines are caught.
 */
export function isInAppPath(path: string): boolean {
  if (!path.startsWith('/')) {
    return false;
  }
  try {
    return new URL(path, PROBE_ORIGIN).origin === PROBE_ORIGIN;
  } catch {
    return false;
  }
}

/**
 * Wraps a route's search schema so a hand-edited or stale link degrades instead
 * of throwing: params that fail validation come out as `undefined` and the
 * rest are kept.
 */
export function lenientSearch<TSchema extends z.ZodObject>(
  schema: TSchema
): TSchema {
  const lenient = z.preprocess((search) => {
    const result = schema.safeParse(search);
    if (result.success || typeof search !== 'object' || search === null) {
      return search;
    }
    // Blank the bad params rather than omit them: the router lays the
    // validated search over the raw one, so an omitted key would keep its raw,
    // invalid value.
    const blanked: Record<string, unknown> = { ...search };
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string') {
        blanked[key] = undefined;
      }
    }
    return blanked;
  }, schema);

  // Typed as the schema it wraps: the output is identical, and the router
  // needs the schema's input type (preprocess erases it to `unknown`) to type
  // `navigate({ search })`.
  return lenient as unknown as TSchema;
}
