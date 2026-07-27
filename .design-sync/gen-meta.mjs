/**
 * Generates the two things the converter can't infer for this repo:
 *
 *  1. `componentSrcMap` — the entry barrel re-exports every symbol in
 *     src/components/ui, so discovery finds ~283 names: one top-level component
 *     per file plus every compound part. Parts stay importable from the bundle
 *     either way; this prunes them down to one card per file.
 *  2. Category doc stubs — group comes from a doc's `category` frontmatter, and
 *     this repo ships no per-component docs, so everything would land in
 *     "general".
 *
 * Both are derived, never hand-maintained: add a file under src/components/ui
 * and the next sync picks it up.
 *
 * Run after a converter build (it reads the discovered names from ds-bundle).
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..');
const uiDir = join(repo, 'src', 'components', 'ui');
const cardsDir = join(repo, 'ds-bundle', 'components');

const CATEGORY = {
  Forms: [
    'autocomplete',
    'checkbox',
    'combobox',
    'country-picker',
    'field',
    'form-skeleton',
    'input',
    'input-group',
    'input-otp',
    'label',
    'number-input',
    'password-input',
    'password-strength-meter',
    'radio-group',
    'search-input',
    'select',
    'slider',
    'switch',
    'textarea'
  ],
  Actions: ['button', 'copy-button', 'toggle', 'toggle-group'],
  Feedback: [
    'alert',
    'alert-dialog',
    'dialog',
    'empty',
    'error-display',
    'not-found',
    'progress',
    'skeleton',
    'sonner'
  ],
  Navigation: [
    'app-sidebar',
    'breadcrumb',
    'link',
    'pagination',
    'sidebar',
    'tabs',
    'tree'
  ],
  'Data display': [
    'avatar',
    'badge',
    'calendar',
    'country-flag',
    'currency-formatter',
    'data-grid',
    'data-grid-checkbox-filter',
    'data-grid-column-header',
    'data-grid-column-visibility',
    'data-grid-pagination',
    'data-grid-radio-filter',
    'data-grid-refresh-button',
    'data-grid-row-actions',
    'data-grid-table',
    'stage-badge',
    'table'
  ],
  Layout: [
    'accordion',
    'aspect-ratio',
    'card',
    'collapsible',
    'dropdown-menu',
    'hover-card',
    'item',
    'popover',
    'scroll-area',
    'separator',
    'sheet',
    'tooltip'
  ]
};

const categoryOf = new Map();
for (const [cat, files] of Object.entries(CATEGORY)) {
  for (const f of files) categoryOf.set(f, cat);
}

// Files whose primary export isn't PascalCase(filename).
const PRIMARY_ALIAS = { 'input-otp': 'InputOTP', sonner: 'Toaster' };

const pascal = (slug) =>
  PRIMARY_ALIAS[slug] ??
  slug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');

const files = readdirSync(uiDir)
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => f.replace(/\.tsx$/, ''));

// Every name the converter discovered, from the last build's card dirs.
const discovered = new Set();
for (const group of readdirSync(cardsDir)) {
  for (const name of readdirSync(join(cardsDir, group))) discovered.add(name);
}

// The primary export for a file is usually PascalCase(filename); when that name
// isn't exported (e.g. sonner.tsx exports Toaster) fall back to the shortest
// discovered export whose source is that file.
const srcMap = {};
const keep = new Set();
const uncategorized = [];
const noPrimary = [];

for (const slug of files) {
  const want = pascal(slug);
  if (!discovered.has(want)) {
    noPrimary.push(slug);
    continue;
  }
  keep.add(want);
  srcMap[want] = `src/components/ui/${slug}.tsx`;
  if (!categoryOf.has(slug)) uncategorized.push(slug);
}

for (const name of discovered) {
  if (!keep.has(name)) srcMap[name] = null;
}

// Category stubs — a doc whose only job is to carry frontmatter.
const docsDir = join(here, 'docs');
mkdirSync(docsDir, { recursive: true });
for (const slug of files) {
  const name = pascal(slug);
  if (!keep.has(name)) continue;
  const cat = categoryOf.get(slug) ?? 'Components';
  writeFileSync(join(docsDir, `${name}.md`), `---\ncategory: ${cat}\n---\n`);
}

const cfgPath = join(here, 'config.json');
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
cfg.componentSrcMap = Object.fromEntries(
  Object.entries(srcMap).sort(([a], [b]) => a.localeCompare(b))
);
cfg.docsDir = '../.design-sync/docs';
writeFileSync(cfgPath, `${JSON.stringify(cfg, null, 2)}\n`);

console.log(
  `kept ${keep.size} top-level, pruned ${Object.values(srcMap).filter((v) => v === null).length}`
);
if (noPrimary.length)
  console.log(`! no PascalCase primary export: ${noPrimary.join(', ')}`);
if (uncategorized.length)
  console.log(`! uncategorized (→ Components): ${uncategorized.join(', ')}`);
