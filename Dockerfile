FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
RUN pnpm prune --production

FROM base
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/build build/
COPY --from=builder /app/drizzle drizzle/
COPY --from=builder /app/package.json ./

EXPOSE 3000
VOLUME [ "/app/data" ]
ENV NODE_ENV=production
ENTRYPOINT ["node", "build/index.js"] 