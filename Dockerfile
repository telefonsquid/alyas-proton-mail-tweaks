# Bun builds and runs it. The built server pulls in nothing else, so no node_modules ships.
FROM oven/bun:1.4.4-alpine AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build:usercss && bun run build

FROM oven/bun:1.4.4-alpine
WORKDIR /app

COPY --from=build /app/build ./build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000
USER bun

CMD ["bun", "build/index.js"]
