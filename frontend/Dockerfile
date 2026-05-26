# =========================================================================
# STAGE 1: Dependencies
# =========================================================================
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependensi
COPY package.json package-lock.json* ./
RUN npm ci

# =========================================================================
# STAGE 2: Builder
# =========================================================================
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Nonaktifkan telemetry Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# Ambil argumen build untuk URL backend agar di-bake oleh Next.js
ARG NEXT_PUBLIC_BACKEND_GO_URL
ENV NEXT_PUBLIC_BACKEND_GO_URL=$NEXT_PUBLIC_BACKEND_GO_URL

RUN npm run build

# =========================================================================
# STAGE 3: Runner (Production Image)
# =========================================================================
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy folder public (termasuk public/circuits untuk file wasm & zkey snarkjs)
COPY --from=builder /app/public ./public

# Copy hasil build standalone Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]