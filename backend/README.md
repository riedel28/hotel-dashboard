# Backend (minimal)

Node.js + Express + Postgres (no ORM). Only endpoints:

- GET `/health`
- GET `/reservations` supporting `_page`, `_limit`, optional `status`, `q`

## Setup

Install deps

```sh
npm --prefix ./backend install
```

Create a Postgres database and set env

```sh
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/tanstack_dashboard
export PORT=5001
export CORS_ORIGIN=http://localhost:5173
```

Apply schema

```sh
psql "$DATABASE_URL" -f ./backend/sql/schema.sql
```

Populate with sample data (optional)

```sh
psql "$DATABASE_URL" -f ./backend/sql/seed.sql
```

Start dev server

```sh
npm --prefix ./backend run dev
```

## Notes

- Base URL expected by the frontend defaults to `http://localhost:5001` (update `VITE_API_BASE_URL` or `src/config/api.ts`)
- Sample data includes 20 reservations from the original `db.json`
- The backend will return empty results until Postgres is set up and schema applied
