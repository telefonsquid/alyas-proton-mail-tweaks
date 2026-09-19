# Bun builds, because the lockfile is Bun's. Node runs it, because that is what adapter-node
# targets and the built server pulls in nothing else.
FROM oven/bun:1-alpine AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build:usercss && bun run build

FROM node:24-alpine
WORKDIR /app

# The whole app, dependencies included, is what the build folder holds. No node_modules ships.
COPY --from=build /app/build ./build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000
USER node

CMD ["node", "build/index.js"]
