# design-sync notes — hotel-dashboard

Repo-specific gotchas for future syncs. Read this before re-running anything.

## This is an app repo, not a design-system package

`package.json` is `private: true` with no `main`/`module`/`exports`, and its
`build` script is an **app** build (`vite build` → hashed assets). There is no
component `dist/` to ship, so the sync builds its own library artifacts into
`ds-dist/` (gitignored) and points the converter at those via `--entry`.

Everything needed to produce `ds-dist/` is in `cfg.buildCmd`, which chains four
steps. Run it from the repo root before the converter:

1. `gen-entry.mjs` — regenerates the barrel of every `src/components/ui/*.tsx`
2. Tailwind CLI → `ds-dist/styles.css`
3. `tsc` with `.cache/tsconfig.dts.json` → `ds-dist/types/`
4. `vite build` with `vite.ds.config.ts` → `ds-dist/index.js`

## Why there's a separate Vite build (do not "simplify" this away)

16 of the UI components use **Lingui macros** (`@lingui/react/macro`). Macros
only work after `@lingui/babel-plugin-lingui-macro` rewrites them. The converter
bundles with bare esbuild and has no babel, so pointing it at `src/` makes it
resolve the macro packages for real and pull in `@lingui/conf` → cosmiconfig →
jiti → node builtins — 66 unresolvable imports, build dead.

So the components are pre-built with the repo's own toolchain
(`.design-sync/vite.ds.config.ts`, which reuses the app's react+lingui plugin
setup) and the converter consumes that output. React stays external — the
converter maps it to `window.React`.

## The `ds-dist/` package boundary

`ds-dist/package.json` exists solely to make the converter treat `ds-dist` as
the package root (it walks up from `--entry` to the first `package.json` with a
`name`). Consequences, all load-bearing:

- `cfg.cssEntry` and `cfg.srcDir` are bounded to the package dir. A path
  escaping it is silently **skipped** (`! cssEntry: … resolves outside the
  package`), which is why the CSS is compiled *into* `ds-dist/` and
  `ds-dist/src` is a symlink to `../src`.
- `cfg.tsconfig` is `../tsconfig.json` — that one is allowed to point out.

## The barrel must use relative specifiers, not `@/` aliases

The converter's ts-morph pass resolves the emitted `.d.ts` **without** tsconfig
paths. An aliased barrel (`export * from '@/components/ui/button'`) resolves to
nothing and discovery silently yields **1 component** instead of 283. This cost
a full debugging cycle. `gen-entry.mjs` emits `../../src/components/ui/<name>`
for exactly this reason.

## Tailwind v4: `src/globals.css` is source, not a stylesheet

It starts with `@import "tailwindcss"`, which only resolves through the Tailwind
build. Shipping it directly gives unstyled previews. It's compiled with the
Tailwind CLI, and the `--content` glob **includes `.design-sync/previews/**`** —
so utility classes used only in an authored preview still get generated. If you
author previews with new utilities, re-run `buildCmd` before validating or those
classes won't exist.

## Component pruning and grouping are generated

`gen-meta.mjs` derives both, from a build's output — never hand-edit
`cfg.componentSrcMap` or `.design-sync/docs/`:

- The barrel re-exports everything, so discovery finds **283** names: 67
  top-level components plus 216 compound parts (`CardHeader`, `DialogFooter`, …).
  The parts stay importable from the bundle; the map prunes them to one card per
  file. `DsProvider` is pruned too — it's the preview provider, not a component.
- Categories come from `category` frontmatter in `.design-sync/docs/*.md` stubs.
  Without them everything lands in one "general" group.

Re-run `gen-meta.mjs` after a build whenever components are added or removed.
Two files don't follow `PascalCase(filename)` and are aliased in that script:
`input-otp` → `InputOTP`, `sonner` → `Toaster`.

## Playwright: cache and repo pin disagree

The repo pins `@playwright/test@^1.60`, which wants chromium **1223**. The
machine cache has chromium **1208**. Installing `playwright@1.58.0` into
`.ds-sync/` matches the cached build and avoids a ~200 MB download. If the cache
changes, find the matching release by checking
`https://raw.githubusercontent.com/microsoft/playwright/v<X.Y.Z>/packages/playwright-core/browsers.json`.

## Emitted `.d.ts` drops native props — this is by design, not a bug

23 of the components are thin wrappers typed as a bare native spread
(`function Input({...}: React.ComponentProps<'input'>)`). The converter's
`lib/dts.mjs` deliberately drops anything declared in `@types/react`:

```js
if (fp.includes('/@types/react/') || fp.includes('/typescript/lib/')) return false;
```

Only `KEEP_PROP` (`children|className|style|as|asChild|ref|id`) survives. For a
DS that declares its own props that's the right call — it strips DOM noise. Here
it strips the *entire* API: `InputProps` came out as five generic props with no
`type`, `placeholder`, `value` or `disabled`.

This matters because the app's self-check reads each `<Name>.d.ts` as the API
contract the design agent codes against — a lossy contract makes it misuse the
component everywhere. Fixed the documented way, with `cfg.dtsPropsFor` bodies
for `Input`, `Textarea` and `Label` (the cases where native props genuinely are
the API). Container-ish wrappers (Card, Alert, Skeleton, Item, …) were left
alone: `className` + `children` really is their whole surface.

Do NOT try to fix this by adding a `lib` to the ts-morph project — that was the
first hypothesis and it is wrong. Both with and without `lib.dom.d.ts` the
checker resolves all 310 props; the loss happens in `isOwnProp`, downstream.

If more components need real contracts later, add `dtsPropsFor` entries — never
fork `dts.mjs` for this.

## Known render warns

These are triaged as legitimate — a warn *not* in this list is new:

- Floor cards on the 8 components whose previews aren't authored yet — the
  deliberate baseline, not a failure: `DataGrid`, `DataGridColumnHeader`,
  `DataGridColumnVisibility`, `DataGridPagination`, `DataGridRowActions`,
  `DataGridTable`, `ErrorDisplay`, `AppSidebar`.
- The final validate is **clean — 67/67 render, zero warnings**. Any warn on a
  future run is new; investigate rather than assume it was always there.
- `[GRID_OVERFLOW]` warnings were all resolved by `cfg.overrides` (24 entries:
  `cardMode: column` for wide components, `cardMode: single` + `primaryStory`
  for portalled ones). Overlay overrides pin `viewport: "900x700"` deliberately —
  that is the capture default, so grades stay valid. Changing it re-keys and
  clears those grades.

## Authoring previews — what the six batches learned

Folded from `.design-sync/learnings/*` after the first sync's fan-out.

**Rules that held for all 52 authored components**

- Import only from `'tanstack-dashboard-ui'`. Compound parts (`FieldLabel`,
  `ToggleGroupItem`, `ComboboxCollection`, …) are exported even though they have
  no card of their own.
- **Read `src/components/ui/<name>.tsx`, not the emitted `.d.ts`.** The `.d.ts`
  describes the root's props only; every compound part's real API lives in the
  source. Previews are compiled by esbuild with **no typecheck**, so props absent
  from the `.d.ts` still compile and render.
- Inline `style={{}}` for layout glue, and `var(--border)` / `var(--muted)` /
  `var(--muted-foreground)` / `var(--card)` for token-correct framing. Theme
  tokens are plain custom properties on `:root`, so they work from inline style.
- Tailwind utility classes in a preview **do** work, but only if the stylesheet
  is recompiled (`buildCmd` step 2 globs `previews/**`). Subagents can't run
  that, so they must stay on inline styles; the orchestrator can use a class
  when a component's only hook is `className` (see CountryFlag below).
- Inline `<svg viewBox="0 0 24 24" …>` with **no** width/height — DS components
  size their SVG children (`[&>svg]:size-3`, `[&_svg:not([class*='size-'])]:size-4`).
  Setting explicit dimensions defeats those rules.
- Overlays capture fine with `defaultOpen`: capture screenshots the whole
  900×700 viewport, not a clipped element, so portalled popups land in the shot.
- The Playwright clock is pinned to **2024-05-15T12:00:00Z** — anchor date-based
  previews to May 2024 for stable captures.
- Sheet PNGs are downscaled hard. Before calling a size sweep wrong, read the
  full-res crop at `_screenshots/review/raw/<group>__<Name>__<Cell>.png`.

**Library-specific traps**

- **Sheet is Radix; everything else is Base UI.** Radix takes `asChild`, Base UI
  takes `render={<Button/>}`. Mixing them silently drops the composed element.
- `DropdownMenuLabel` is Base UI's `Menu.GroupLabel` and **throws** outside a
  `DropdownMenuGroup`/`DropdownMenuRadioGroup`.
- A blank overlay cell is almost always a **render throw**, not a positioning
  bug — the throw unmounts the root and captures blank with no `⚠`. Probe with a
  Playwright `pageerror` listener on `<Name>.html?story=<Export>`.
- `SelectValue` only resolves a label if the root gets an `items` map, otherwise
  the trigger prints the raw value. `ComboboxEmpty` counts the root's `items`
  prop, not rendered children.
- Base UI multi-value roots take arrays: `ToggleGroup defaultValue={['x']}`,
  `Accordion defaultValue={['x']}`.
- Components with no intrinsic size need one from the caller: `Progress`,
  `Skeleton`, `ScrollArea` (root height, or nothing scrolls), `AspectRatio`
  (children need `position:absolute; inset:0`).

## DS bugs found while authoring (not sync problems)

Worth fixing in the component library itself:

- **`CountryFlag` fallback drops its props.** The unknown-code branch renders the
  placeholder span with only `className`/`aria-label` and never spreads `...props`,
  so `style` is silently ignored and the chip collapses to zero size. `className`
  is its only sizing hook.
- **`Empty`** has `rounded-lg border-dashed` with **no border width** — the dashed
  style is inert and the default render is a near-invisible block.
- **`CollapsibleTrigger`** ships with no classes at all; naive use renders a bare
  browser button. Canonical usage is `render={<Button variant="outline" />}`.
- **`Checkbox` `indeterminate`** paints a checkmark on an unfilled box — the
  indicator hardcodes `CheckIcon` with no dash branch.
- **`Button` `size="lg"`** is byte-identical to `default` — a no-op variant.
- **`Badge`** cva default (`sm`) disagrees with the signature default (`md`); the
  signature wins. There is **no `color="green"`** — it silently renders unstyled.
- **`CountryPicker` trigger** has no `disabled:` or `aria-invalid:` rules, so both
  states are pixel-identical to resting (unlike `SelectTrigger`).
- **`Calendar captionLayout="dropdown"` is broken** — `calendar.tsx` supplies no
  `classNames` for react-day-picker's dropdown slots, so unstyled native selects
  overflow the caption box. Treat as unsupported until fixed.
- **`--muted` and `--accent` are the same oklch value** in both themes, so any
  surface built from both renders flat.
- **`ScrollArea`** renders its own vertical `ScrollBar`; a horizontal one passed as
  a child lands inside the viewport. Horizontal scrolling isn't expressible.
- **`toast` was not reachable** from the library — `sonner.tsx` exports only
  `Toaster`. `gen-entry.mjs` now re-exports `toast` from sonner so the component is
  actually usable.

## Components that need context (compose inside their parent)

Render errors seen on the unauthored floor cards, all expected:

- `DataGrid*` — need `useDataGrid`; compose inside `DataGrid` with a real
  TanStack Table instance. Still unauthored (floor cards) — out of the first
  sync's scope.
- `Sidebar` — previewable with no config change: compose
  `SidebarProvider` → `Sidebar collapsible="none"`. That's the only mode not
  positioned against the viewport; `offcanvas`/`icon` render `fixed inset-y-0`
  and escape the card. Note the capture viewport (900×700) is above the 768px
  `useIsMobile` breakpoint, so Sidebar takes the desktop path.
- **Resolved:** `Toaster` (ThemeProvider), `Link`/`BreadcrumbLink`/`NotFound`
  (router) are all handled now — `.design-sync/ds-provider.tsx` wraps previews in
  I18n → Theme → `RouterContextProvider`. `RouterContextProvider`, *not*
  `RouterProvider`: the latter renders the matched route instead of `children`.

## Re-sync risks

- **`node_modules/tanstack-dashboard` self-symlink** was created while
  diagnosing discovery and is no longer needed now that `--entry` is passed. It
  is not recreated by any script; nothing should depend on it.
- **`ds-dist/src` symlink** IS load-bearing (see package boundary above) and is
  recreated only by hand — if `srcDir` stops matching, check it exists.
- **Catalog language is pinned to English.** `ds-provider.tsx` activates
  `src/locales/en/messages.po`. German previews would need a second provider.
- **The `.po` catalog must be compiled** (`bun run lingui:compile`) or the
  provider imports a stale/missing catalog. Strings added since the last extract
  render as their message id.
- **Only partially verified:** components needing router/theme/sidebar context
  ship as floor cards; their runtime behaviour inside claude.ai/design has not
  been exercised.
- **Toolchain assumed:** node ≥22.19, bun for the app's own scripts, npm for the
  isolated `.ds-sync/` deps, Tailwind CLI fetched via `bunx` (network).
