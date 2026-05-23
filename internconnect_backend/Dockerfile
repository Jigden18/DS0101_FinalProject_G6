# ── Stage 1: production dependencies only ────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ── Stage 2: full build — devDependencies needed for prisma generate ──────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

# ── Stage 3: lean production runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# openssl required by Prisma client at runtime
RUN apk add --no-cache openssl

# Copy production node_modules from stage 1
COPY --from=deps    /app/node_modules ./node_modules
# Copy the generated Prisma client (overwrites the stub in node_modules)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Copy source and config
COPY --from=builder /app/src          ./src
COPY --from=builder /app/prisma       ./prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/uploads      ./uploads

# Run as non-root for security
USER node

EXPOSE 5000
CMD ["node", "src/server.js"]