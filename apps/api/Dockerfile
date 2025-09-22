FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY packages/prisma/package.json ./packages/prisma/
COPY packages/shared/package.json ./packages/shared/
COPY packages/redis/package.json ./packages/redis/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY packages/prisma/package.json ./packages/prisma/
COPY packages/shared/package.json ./packages/shared/
COPY packages/redis/package.json ./packages/redis/
COPY apps/api/package.json ./apps/api/

# Copy source code
COPY packages/prisma ./packages/prisma
COPY packages/shared ./packages/shared
COPY packages/redis ./packages/redis
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build packages
RUN pnpm --filter @pomogator/shared build
RUN pnpm --filter @pomogator/redis build
RUN pnpm --filter @pomogator/prisma generate
RUN pnpm --filter @pomogator/api build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY packages/prisma/package.json ./packages/prisma/
COPY packages/shared/package.json ./packages/shared/
COPY packages/redis/package.json ./packages/redis/
COPY apps/api/package.json ./apps/api/

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built applications
COPY --from=builder /app/packages/prisma/dist ./packages/prisma/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/redis/dist ./packages/redis/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/prisma/node_modules/.prisma ./packages/prisma/node_modules/.prisma

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api

# Change ownership
RUN chown -R api:nodejs /app
USER api

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "apps/api/dist/index.js"]
