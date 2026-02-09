# Backend Dockerfile — build context must be the project root
# because the backend imports from shared/types/
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY backend/package.json backend/bun.lock* ./backend/
RUN cd backend && bun install --frozen-lockfile --production

# Copy backend source and shared types
COPY backend/ ./backend/
COPY shared/ ./shared/

EXPOSE 5001

WORKDIR /app/backend
CMD ["bun", "src/index.ts"]
