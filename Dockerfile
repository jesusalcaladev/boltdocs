# Build stage
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /app
WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm run build --filter boltdocs --filter docs

# Production stage
FROM base AS prod
WORKDIR /app

# Copy built assets and necessary files for production
COPY --from=build /app/docs/dist /app/dist
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml

# Install a simple static file server
RUN pnpm add -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
