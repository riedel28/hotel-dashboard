# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Project Context

This is a **hotel management dashboard** application with a dual-view system (User View for front-office operations, Admin View for administrative functions).

## Development Commands

### Frontend (Root Directory)

- `bun run dev` - Start full-stack development (client + backend concurrently)
- `bun run client` - Start frontend only with Vite
- `bun run build` - Build for production (includes typecheck)
- `bun run typecheck` - Run TypeScript type checking
- `bun run typecheck:all` - Check both main and node TypeScript configs
- `bun run lint` - Run oxlint with auto-fix
- `bun run check` - Run oxlint with auto-fix, then format with oxfmt
- `bun run check:ci` - Same checks without writing (what CI runs)
- `bun run format` - Format code with oxfmt
- `bun run test` - Run unit tests once (Vitest)
- `bun run test:watch` - Run unit tests in watch mode
- `bun run test:coverage` - Run unit tests with coverage
- `bun run test:e2e` - Run Playwright end-to-end tests (see the warning under Local Dev Server)
- `bun run preview` - Preview production build

### Backend (./backend/)

- `bun run dev` - Start backend in watch mode
- `bun run start` - Start backend in production mode
- `bun run test` - Run backend tests
- `bun run test:watch` - Run backend tests in watch mode

### Database (./backend/)

- `bun run db:seed` - Seed database with sample data
- `bun run db:generate -- --name <what_changed>` - Generate a migration from schema changes
- `bun run db:migrate` - Apply pending migrations to the dev database
- `bun run db:migrate:prod` - Apply pending migrations to production
- `bun run db:studio` - Open Drizzle Studio GUI

### Extract/compile internationalization

- `bun run lingui:extract` - Extract translatable strings
- `bun run lingui:compile` - Compile translation catalogs

## Architecture Overview

### Frontend Stack

- **React 19** with TypeScript and Vite
- **TanStack Router** for file-based routing with type-safe navigation
- **TanStack Query** for server state management and caching
- **TanStack Table** for complex data grids
- **Lingui** for internationalization (English/German)
- **Tailwind CSS 4** with shadcn/ui components
- **Base UI** (`@base-ui/react`) primitives for accessibility; only Dialog and Slot still come from Radix
- **React Hook Form** with Zod for forms
- **Vitest** + Testing Library for unit tests, **Playwright** for end-to-end tests
- **oxlint** and **oxfmt** for linting and formatting

### Backend Stack

- **Express 5** with TypeScript, run by **Bun** (transpiled, not type-checked)
- **PostgreSQL** with **Drizzle ORM**
- **Zod** for runtime validation

### Key Architectural Patterns

#### View-Based Architecture

- **User View**: Front-office operations (reservations, rooms, users, content management, integrations)
- **Admin View**: Administrative functions (properties); administrators only
- **URL-derived**: the view is not stored anywhere — `useCurrentView()` (`src/hooks/use-current-view.ts`) returns `admin` when the path starts with `/admin`, otherwise `user`
- **Dynamic Sidebar**: Different navigation based on current view

#### Route Organization

- Routes are file-based using TanStack Router
- Layout routes: `_auth-layout.tsx`, `_dashboard-layout.tsx`
- View-specific folders under `_dashboard-layout/`: `(user-view)` is a pathless group, `admin/` is a real `/admin` path segment
- Guards at layout level: `_dashboard-layout.tsx` requires a signed-in user, `_dashboard-layout/admin.tsx` requires `is_admin`

#### Component Architecture

- shadcn/ui components in `src/components/ui/`
- Feature-specific components co-located with routes
- Component folders use `-components/` naming convention

### Email Verification & Token System

- `emailVerificationTokens` table handles three token types: `'verification'`, `'invitation'`, `'reset'`
- Token flow pattern: generate token → store in DB with expiry → send email with link → validate on use → mark `used_at` in transaction
- Always return generic 200 responses for email-based endpoints (forgot-password, resend-verification) to prevent email enumeration
- Invalidate old unused tokens (set `used_at`) before creating new ones for the same user/type
- Password reset tokens expire in 1 hour; verification/invitation tokens expire in 24h/7d
- Email templates live in `backend/src/utils/email.ts` — use `emailLayout()` wrapper for consistent styling
- Controllers in `backend/src/controllers/verification-controller.ts`, routes in `backend/src/routes/verification.ts`

### Auth Pages Pattern

- Auth pages live under `src/routes/_auth-layout/auth/`
- Token-based pages (accept-invitation, reset-password, verify-email) read `token` from search params via `validateSearch`
- Three-state pattern: no token → error view, form → input view, mutation success → success view
- Use `useMutation` from TanStack Query for form submissions, not `react-hook-form`'s `isSubmitting`
- Success/error views use consistent icon+heading+description+link layout

### Environment Configuration

#### Frontend

- `VITE_API_BASE_URL` - Backend API URL (default: <http://localhost:5001/api>)

#### Backend

- `DATABASE_URL` - PostgreSQL connection string (Neon serverless — may have cold-start delays)
- `CORS_ORIGIN` - Allowed frontend origin (default: <http://localhost:5173>)
- Port defaults to 5001 (not 3001)
- SMTP configured via `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `APP_URL` - Used for email links (e.g. verification, reset password)
- Mailtrap sandbox (`sandbox.smtp.mailtrap.io`) for dev; switch to `live.smtp.mailtrap.io` with a verified domain for real delivery

### Database

- Hosted on **Neon** (serverless PostgreSQL) — connections may fail on cold start, retries resolve it
- Schema managed with **Drizzle ORM** and **migration files** in `backend/drizzle/` — they are the source of truth for every database. To change the schema: edit `backend/src/db/schema.ts`, run `bun run db:generate -- --name <what_changed>` (non-interactive for additive changes; it only prompts when it has to guess a rename), review the generated SQL, commit it, then `bun run db:migrate` (dev) and `bun run db:migrate:prod` at deploy. `db:migrate` never prompts
- Do not use `db:push` for changes you intend to keep: it bypasses the migration journal and the databases drift apart (there is deliberately no `db:push:prod`). The backend test database is built from the migration files, so a schema change without its migration fails the tests
- `drizzle-kit` does not always detect a changed check constraint. If the generated migration misses it, add the SQL to that migration file by hand:
  ```sql
  ALTER TABLE table_name DROP CONSTRAINT IF EXISTS constraint_name;
  ALTER TABLE table_name ADD CONSTRAINT constraint_name CHECK (...);
  ```

## Development Guidelines

### TypeScript

- Strict TypeScript configuration
- No `any` types allowed without explicit permission

### Icon Imports

Always import icons with the `Icon` suffix for clarity:

```typescript
import { UserIcon, LockIcon, ShieldIcon } from 'lucide-react'
```

### Internationalization

- Use `<Trans>` components for JSX text: `<Trans>Forgot Password</Trans>`
- Use `t` macro for strings, validation messages, toasts: `` t`Email is required` ``
- Do not call translation macros at module scope (locale may not be activated yet)
- For labels that must live in module-scope data (e.g. the nav item catalog), declare lazy descriptors with `msg` from `@lingui/core/macro` and resolve them in the component with `t(descriptor)` from `useLingui()` — `msg` translates nothing by itself, so the rule above still holds
- Extract strings with `bun run lingui:extract`, compile with `bun run lingui:compile`

### Git Commits

Use conventional commit format: `type(scope): description`

- `feat(header): add sticky positioning`
- `fix(scroll): prevent iOS bounce effect`
- `refactor(layout): improve sidebar structure`

### Pre-Commit Validation

Always run before committing:

- `bun run typecheck:all` - Verify TypeScript compilation
- `bun run check` - Ensure code quality and formatting

> **Backend `tsc` OOMs.** Running a full backend type-check (`cd backend && tsc --noEmit`) exhausts the Node heap (>8 GB) because of Drizzle ORM's + `drizzle-zod`'s inferred type graph — it is effectively unrunnable and is **not** part of the gate. Bun runs the backend by transpiling (no type-check), so this doesn't affect runtime. To sanity-check backend files, transpile them instead: `bun build <file> --target=node`. The `typecheck:all` gate above covers the frontend + node configs only.

### Local Dev Server

- Do NOT kill or stop the user's local dev server (`bun run dev`, `bun run client`, Vite, etc.), even after testing in a browser. Assume the user is running their own server and leave it running.
- When testing in a browser, reuse the already-running server (default `http://localhost:5173`). Only start your own if none is running — and if you started it yourself, you may stop that instance, but never the user's.
- Do NOT run `bun run test:e2e` while anything is listening on port 5001 or 5173. Locally Playwright reuses a running server, and every spec calls `POST /api/test/reset`, which truncates and reseeds whatever database that backend uses — against the user's dev server that wipes the dev database. Check the ports right before each run.
