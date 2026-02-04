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

### Environment Configuration

#### Frontend

- `VITE_API_BASE_URL` - Backend API URL (default: <http://localhost:3001>)

#### Backend

- `DATABASE_URL` - PostgreSQL connection string
- `CORS_ORIGIN` - Allowed frontend origin (default: <http://localhost:5173>)
- Port defaults to 3001

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
