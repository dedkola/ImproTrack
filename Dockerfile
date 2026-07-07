# Development Dockerfile for ImproTrack
FROM node:26-alpine
WORKDIR /app

# Install pnpm via npm instead of corepack (more reliable in Alpine)
RUN npm install -g pnpm@11.1.0

ENV NODE_ENV=development
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]
