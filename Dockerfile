FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
# npm cache persists on the host between builds — no re-download on source changes
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_STORE_LABEL
ARG NEXT_PUBLIC_BAKONG_MOBILE
ARG NEXT_PUBLIC_MINIO_URL
ARG NEXT_PUBLIC_MINIO_BUCKET
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STORE_LABEL=$NEXT_PUBLIC_STORE_LABEL
ENV NEXT_PUBLIC_BAKONG_MOBILE=$NEXT_PUBLIC_BAKONG_MOBILE
ENV NEXT_PUBLIC_MINIO_URL=$NEXT_PUBLIC_MINIO_URL
ENV NEXT_PUBLIC_MINIO_BUCKET=$NEXT_PUBLIC_MINIO_BUCKET

# Next.js build cache persists — only changed pages are recompiled
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# ── Runner — standalone: no node_modules copy ──────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/public           ./public
COPY --from=builder /app/messages         ./messages

EXPOSE 3000
CMD ["node", "server.js"]
