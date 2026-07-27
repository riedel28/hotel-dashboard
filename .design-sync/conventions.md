## How to build with this library

Components come from `window.HotelDashboardUI` (root `_ds_bundle.js`). It is a
hotel back-office system: reservations, folios, housekeeping, rate plans.

### Wrap every tree in `DsProvider`

`DsProvider` is exported from the bundle and supplies three contexts. Without it
components do not merely lose styling — they throw and the subtree unmounts:

- **i18n** — 16 components call Lingui macros and read an activated catalog.
- **theme** — `Toaster` calls `useTheme`.
- **router** — `Link`, `BreadcrumbLink` and `NotFound` wrap TanStack Router.

```jsx
const { DsProvider, Card, CardHeader, CardTitle, Button } = window.HotelDashboardUI;

<DsProvider>
  <YourScreen />
</DsProvider>
```

### Styling idiom: Tailwind v4 utilities + semantic tokens

Style your own layout with Tailwind utility classes. Do **not** write raw hex or
`rgb()` colours, and do not reach for palette classes like `bg-slate-100` — the
theme is token-based and carries light and dark automatically.

Colour classes, all backed by real tokens in the stylesheet:

| Family | Use |
|---|---|
| `bg-background` `bg-card` `bg-popover` `bg-muted` `bg-accent` | surfaces |
| `bg-primary` `bg-secondary` `bg-destructive` | filled actions |
| `text-foreground` `text-muted-foreground` `text-card-foreground` | body and secondary text |
| `text-primary` `text-destructive` `text-danger` | accent and error text |
| `border-border` `border-input` `border-destructive` | borders |
| `bg-sidebar` `text-sidebar-foreground` `border-sidebar-border` | sidebar surfaces |

`--danger` is destructive text on a neutral surface; `--destructive` is the fill.
Prefix any colour with `dark:` for a dark-mode override — `dark:bg-card`.

Layout, spacing, sizing and type follow standard Tailwind: `flex` `grid`
`grid-cols-{1..12}` `col-span-*` `items-center` `justify-between` `gap-*` `p-*`
`m-*` `space-y-*` `w-full` `max-w-{sm..7xl}` `text-{xs..5xl}` `font-{medium,semibold,bold}`
`rounded-{sm,md,lg,xl,full}` `shadow-{sm,md,lg}` `truncate` `line-clamp-*`,
with `sm:` `md:` `lg:` responsive prefixes and `hover:` states.

**The stylesheet is precompiled**, so stay inside those families. An exotic
utility (`grid-cols-13`, `p-[17px]`, `bg-[#abc]`) was never compiled and will do
nothing. When you need a value outside the scale, use an inline `style` with a
token: `style={{ borderColor: 'var(--border)' }}`.

### Where the truth lives

- `_ds/<folder>/styles.css` and its `@import` closure — every token and utility
  that actually exists. Read it before inventing a class.
- `components/<group>/<Name>/<Name>.prompt.md` — per-component usage and props.
- `components/<group>/<Name>/<Name>.d.ts` — the prop contract.

Components are grouped as **actions**, **forms**, **feedback**, **layout**,
**navigation** and **data-display**.

### Composition notes that bite

- Compound parts (`CardHeader`, `FieldLabel`, `SelectItem`, `TableRow`, …) are
  exported from the bundle but have no card of their own — import them by name.
- Most overlays are **Base UI**: compose a trigger with `render={<Button/>}`.
  `Sheet` is **Radix** and uses `asChild` instead.
- `DropdownMenuLabel` must sit inside `DropdownMenuGroup` or it throws.
- Toasts: `Toaster` renders the region, `toast()` pushes — both are exported.

### An idiomatic screen

```jsx
const {
  DsProvider, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Badge, Button, Field, FieldLabel, Input
} = window.HotelDashboardUI;

<DsProvider>
  <div className="p-6 space-y-6 bg-background">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-foreground">Arrivals</h1>
      <Button>Check in guest</Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Reservation 4821</CardTitle>
          <CardDescription>Anna Krüger · 3 nights · Deluxe double</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Arriving Friday 14 August. Late check-in requested.
          </p>
          <Badge color="orange">Awaiting room</Badge>
          <Field>
            <FieldLabel htmlFor="room">Assign room</FieldLabel>
            <Input id="room" placeholder="e.g. 214" />
          </Field>
        </CardContent>
      </Card>
    </div>
  </div>
</DsProvider>
```
