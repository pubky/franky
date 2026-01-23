# Stage 1: Dependencies
FROM node:22.16.0-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Stage 2: Builder
FROM node:22.16.0-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Declare build arguments for Next.js public env vars (baked at build time)
ARG NEXT_PUBLIC_DB_VERSION=1
ARG NEXT_PUBLIC_SYNC_TTL=300000
ARG NEXT_PUBLIC_DEBUG_MODE=false
ARG NEXT_PUBLIC_TTL_POST_MS=4000
ARG NEXT_PUBLIC_TTL_USER_MS=600000
ARG NEXT_PUBLIC_HOMESERVER
ARG NEXT_PUBLIC_NEXUS_URL
ARG NEXT_PUBLIC_TESTNET
ARG NEXT_PUBLIC_DEFAULT_HTTP_RELAY
ARG NEXT_PUBLIC_MODERATION_ID
ARG NEXT_PUBLIC_MODERATED_TAGS
ARG BASE_URL_SUPPORT
ARG SUPPORT_API_ACCESS_TOKEN
ARG SUPPORT_ACCOUNT_ID
ARG SUPPORT_FEEDBACK_INBOX_ID

# Set environment variables for build
ENV NEXT_PUBLIC_DB_VERSION=$NEXT_PUBLIC_DB_VERSION
ENV NEXT_PUBLIC_SYNC_TTL=$NEXT_PUBLIC_SYNC_TTL
ENV NEXT_PUBLIC_DEBUG_MODE=$NEXT_PUBLIC_DEBUG_MODE
ENV NEXT_PUBLIC_TTL_POST_MS=$NEXT_PUBLIC_TTL_POST_MS
ENV NEXT_PUBLIC_TTL_USER_MS=$NEXT_PUBLIC_TTL_USER_MS
ENV NEXT_PUBLIC_HOMESERVER=$NEXT_PUBLIC_HOMESERVER
ENV NEXT_PUBLIC_NEXUS_URL=$NEXT_PUBLIC_NEXUS_URL
ENV NEXT_PUBLIC_TESTNET=$NEXT_PUBLIC_TESTNET
ENV NEXT_PUBLIC_DEFAULT_HTTP_RELAY=$NEXT_PUBLIC_DEFAULT_HTTP_RELAY
ENV NEXT_PUBLIC_MODERATION_ID=$NEXT_PUBLIC_MODERATION_ID
ENV NEXT_PUBLIC_MODERATED_TAGS=$NEXT_PUBLIC_MODERATED_TAGS
ENV BASE_URL_SUPPORT=$BASE_URL_SUPPORT
ENV SUPPORT_API_ACCESS_TOKEN=$SUPPORT_API_ACCESS_TOKEN
ENV SUPPORT_ACCOUNT_ID=$SUPPORT_ACCOUNT_ID
ENV SUPPORT_FEEDBACK_INBOX_ID=$SUPPORT_FEEDBACK_INBOX_ID

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:22.16.0-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose the default Next.js port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run the standalone server
CMD ["node", "server.js"]
