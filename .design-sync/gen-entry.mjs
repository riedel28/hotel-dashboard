/**
 * Regenerates the library entry barrel for design-sync.
 *
 * The repo ships no library entry (it's an app), so the converter needs one
 * built for it. Generated rather than committed so a component added under
 * src/components/ui is picked up by the next sync without anyone remembering
 * to edit a list.
 */
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const uiDir = join(here, '..', 'src', 'components', 'ui');

const lines = readdirSync(uiDir)
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => f.replace(/\.tsx$/, ''))
  .sort()
  // Relative, not the `@/` alias: these specifiers survive into the emitted
  // .d.ts, and the converter's ts-morph pass resolves without tsconfig paths —
  // an aliased barrel silently yields zero components.
  .map((n) => `export * from '../../src/components/ui/${n}';`);

// The preview provider ships in the same bundle so `cfg.provider` can name it.
lines.push(`export { DsProvider } from '../ds-provider';`);

// `Toaster` renders an empty region without a way to push a toast, and the app
// itself imports `toast` straight from sonner. Re-exporting it makes the
// component usable by whoever builds with this bundle.
lines.push(`export { toast } from 'sonner';`);

mkdirSync(join(here, '.cache'), { recursive: true });
writeFileSync(join(here, '.cache', 'ds-entry.ts'), `${lines.join('\n')}\n`);
console.log(`ds-entry.ts: ${lines.length} exports`);
