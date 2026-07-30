# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is a **hotel management dashboard** application with a dual-view system (User View for front-office operations, Admin View for administrative functions).

## Architecture Overview

### Key Architectural Patterns

#### View-Based Architecture

- **User View**: Front-office operations (reservations, payments, content management)
- **Admin View**: Administrative functions (properties, customers)
- **Context-driven**: Uses React Context (`ViewProvider`) with localStorage persistence
- **Auto-switching**: Route-based automatic view switching with undo functionality
- **Dynamic Sidebar**: Different navigation based on current view

#### Route Organization

- Routes are file-based using TanStack Router
- Layout routes: `_auth-layout.tsx`, `_dashboard-layout.tsx`
- Nested routing with view-specific folders: `(admin-view)`, `(user-view)`
- Authentication guards at layout level

#### Component Architecture

- shadcn/ui components in `src/components/ui/`
- Feature-specific components co-located with routes
- Component folders use `-components/` naming convention

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
- Schema managed with **Drizzle ORM**; `db:push` applies changes directly, `db:generate` creates migration files (interactive, may not work in CI)
- `db:push` is **interactive** — it prints the DDL and waits for an arrow-key "Yes/No" confirmation, so it hangs in non-interactive/agent shells. Either run it yourself (e.g. `! cd backend && bun run db:push`), or, for purely additive changes, apply the printed DDL directly (idempotent `CREATE TABLE IF NOT EXISTS …` / `CREATE INDEX IF NOT EXISTS …`) against `DATABASE_URL`.
- Check constraints must be updated manually via SQL if `db:push` doesn't detect the change:
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
- Extract strings with `bun run lingui:extract`, compile with `bun run lingui:compile`

### Local Dev Server

- Do NOT kill or stop the user's local dev server (`bun run dev`, `bun run client`, Vite, etc.), even after testing with Chrome DevTools or Playwright. Assume the user is running their own server and leave it running.
- When testing in a browser, reuse the already-running server (default `http://localhost:5173`). Only start your own if none is running — and if you started it yourself, you may stop that instance, but never the user's.

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
