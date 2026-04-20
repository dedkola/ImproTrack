# Development Dockerfile for ImproTrack
FROM node:22-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate
ENV NODE_ENV=development
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]
