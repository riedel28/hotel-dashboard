# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Root Directory)

- `npm run dev` - Start full-stack development (client + backend concurrently)
- `npm run client` - Start frontend only with Vite
- `npm run build` - Build for production (includes type-check)
- `npm run type-check` - Run TypeScript type checking
- `npm run type-check:all` - Check both main and node TypeScript configs
- `npm run lint` - Run ESLint with strict rules (max 0 warnings)
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run preview` - Preview production build

### Backend (./backend/)

- `npm run dev` - Start backend in watch mode
- `npm run start` - Start backend in production mode
- `npm run build` - TypeScript build check (no output)
- `npm run typecheck` - TypeScript type checking
- `npm run db:reseed` - Reseed database with sample data

### Internationalization

- `npm run lingui:extract` - Extract translatable strings
- `npm run lingui:compile` - Compile translation catalogs

## Architecture Overview

### Frontend Stack

- **React 19** with TypeScript and Vite
- **TanStack Router** for file-based routing with type-safe navigation
- **TanStack Query** for server state management and caching
- **TanStack Table** for complex data grids
- **Lingui** for internationalization (English/German)
- **Tailwind CSS** with shadcn/ui components
- **Radix UI** primitives for accessibility
- **Axios** for HTTP client with error handling

### Backend Stack

- **Express.js** with TypeScript
- **PostgreSQL** with custom connection pool
- **Zod** for runtime validation
- **CORS** configured for local development

### Key Architectural Patterns

#### View-Based Architecture

The application features a sophisticated dual-view system:

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
- Type-safe navigation with route context

#### Data Management

- Centralized API client with environment-based configuration
- Error handling with user-friendly messages
- Consistent data validation using Zod schemas
- TanStack Query for caching, background updates, and optimistic updates

#### Component Architecture

- shadcn/ui components in `src/components/ui/`
- Feature-specific components co-located with routes
- Component folders use `-components/` naming convention
- Reusable data grid components with sorting, filtering, pagination

### Environment Configuration

#### Frontend Environment Variables

- `VITE_API_BASE_URL` - Backend API URL (default: <http://localhost:3001>)

#### Backend Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `CORS_ORIGIN` - Allowed frontend origin (default: <http://localhost:5173>)
- Port defaults to 3001

### Database

- PostgreSQL schema in `backend/sql/schema.sql`
- Seed data in `backend/sql/seed.sql`
- Use `npm run db:reseed` to reset database

### Development Guidelines

#### TypeScript

- Strict TypeScript configuration
- No `any` types allowed without explicit permission
- Type-safe routing and API calls

#### Internationalization

- Use `<Trans>` components for JSX text
- Use `t` macro for strings, validation messages, toasts
- Extract strings with `npm run lingui:extract`
- Compile with `npm run lingui:compile`

#### Styling

- Tailwind CSS with custom design system
- Component variants using `class-variance-authority`
- Consistent spacing and typography scale

#### Code Quality

- ESLint with strict rules (0 warnings allowed)
- Prettier for consistent formatting
- Husky hooks for pre-commit validation
- Semantic release workflow

### Key Files and Folders

#### Frontend Structure

- `src/routes/` - File-based routing structure
- `src/components/ui/` - Reusable UI components
- `src/contexts/` - React contexts (view switching)
- `src/hooks/` - Custom React hooks
- `src/api/` - API client and service functions
- `src/lib/` - Utility functions and helpers

#### Backend Structure

- `backend/src/routes/` - Express route handlers
- `backend/src/db/` - Database connection and utilities
- `backend/sql/` - Database schema and seed files

### Testing and Validation

Always run the linting and type-checking commands before committing:

- `npm run type-check:all` - Verify TypeScript compilation
- `npm run lint` - Ensure code quality standards
- `npm run format:check` - Verify code formatting

The application includes comprehensive error boundaries, loading states, and form validation to ensure a robust user experience.
