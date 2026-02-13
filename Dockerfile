# All-in-One Dockerfile - Backend (NestJS) + Frontend (Next.js)
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# ============= BACKEND BUILD =============
FROM base AS backend-deps
WORKDIR /backend
COPY apps/backend/package*.json ./
COPY apps/backend/prisma ./prisma/
RUN npm ci --only=production

FROM base AS backend-build
WORKDIR /backend
COPY apps/backend/package*.json ./
RUN npm ci
COPY apps/backend/ ./
RUN npx prisma generate && npm run build

# ============= FRONTEND BUILD =============
FROM base AS frontend-deps
WORKDIR /app
COPY package*.json nx.json tsconfig*.json ./
RUN npm ci --legacy-peer-deps

FROM base AS frontend-build
WORKDIR /app
COPY --from=frontend-deps /app/node_modules ./node_modules
COPY . ./
RUN npx nx build nextn --configuration=production

# ============= FINAL IMAGE =============
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install PM2 globally for process management
RUN npm install -g pm2

# Copy backend
WORKDIR /app/backend
COPY --from=backend-build /backend/dist ./dist
COPY --from=backend-deps /backend/node_modules ./node_modules
COPY --from=backend-build /backend/package.json ./
COPY --from=backend-build /backend/prisma ./prisma

# Copy frontend (full source + dependencies for Nx serve)
WORKDIR /app/frontend
COPY --from=frontend-build /app/apps/nextn ./apps/nextn
COPY --from=frontend-build /app/node_modules ./node_modules
COPY --from=frontend-build /app/package.json ./
COPY --from=frontend-build /app/nx.json ./
COPY --from=frontend-build /app/tsconfig.base.json ./

# Setup PM2 config
WORKDIR /app
COPY pm2.config.js ./

# Create non-root user and set permissions
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs && \
    mkdir -p /app/backend/prisma /app/logs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001 9002

CMD ["pm2-runtime", "start", "pm2.config.js"]
