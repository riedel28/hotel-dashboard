# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is a **hotel management dashboard** application with a dual-view system (User View for front-office operations, Admin View for administrative functions).

## Development Commands

### Frontend (Root Directory)

- `bun run dev` - Start full-stack development (client + backend concurrently)
- `bun run client` - Start frontend only with Vite
- `bun run build` - Build for production (includes type-check)
- `bun run type-check` - Run TypeScript type checking
- `bun run type-check:all` - Check both main and node TypeScript configs
- `bun run lint` - Run Biome linter with auto-fix
- `bun run check` - Run Biome check with auto-fix (lint + format)
- `bun run format` - Format code with Biome
- `bun run test` - Run tests once
- `bun run test:watch` - Run tests in watch mode
- `bun run test:coverage` - Run tests with coverage
- `bun run preview` - Preview production build

### Backend (./backend/)

- `bun run dev` - Start backend in watch mode
- `bun run start` - Start backend in production mode
- `bun run test` - Run backend tests
- `bun run test:watch` - Run backend tests in watch mode

### Database (./backend/)

- `bun run db:seed` - Seed database with sample data
- `bun run db:generate` - Generate Drizzle migrations
- `bun run db:push` - Push schema changes to database
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
- **Tailwind CSS** with shadcn/ui components
- **Radix UI** primitives for accessibility

### Backend Stack

- **Express.js** with TypeScript
- **PostgreSQL** with **Drizzle ORM**
- **Zod** for runtime validation

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
- Schema managed with **Drizzle ORM**; `db:push` applies changes directly, `db:generate` creates migration files (interactive, may not work in CI)
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

### Git Commits

Use conventional commit format: `type(scope): description`

- `feat(header): add sticky positioning`
- `fix(scroll): prevent iOS bounce effect`
- `refactor(layout): improve sidebar structure`

### Pre-Commit Validation

Always run before committing:

- `bun run type-check:all` - Verify TypeScript compilation
- `bun run check` - Ensure code quality and formatting
