# Docker Setup for ImproTrack

Docker configuration for local development.

## Files Included

- **Dockerfile**: Development image definition
- **docker-compose.yml**: Development environment setup
- **.dockerignore**: Files excluded from Docker builds

## Prerequisites

- Docker and Docker Compose installed
- `.env.local` file with Firebase credentials (see `.env.example`)

## Development Setup

### Quick Start

```bash
# Copy environment variables
cp .env.example .env.local
# Fill in your Firebase credentials in .env.local

# Start the development server
docker-compose up --build

# The app will be available at http://localhost:3000
```

### Development Commands

```bash
# Start services in the background
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild after dependency changes
docker-compose up --build

# Run a command inside the container
docker-compose exec app pnpm typecheck
docker-compose exec app pnpm check
```

### Features

- Hot reload enabled with volume mounts
- All source files mounted for live editing
- Node modules and .next cached in volumes for performance
- NEXT_ALLOWED_DEV_ORIGINS configured for network access

## Environment Variables

Create `.env.local` with the following required Firebase variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_SITE_URL=
```

## Accessing from Other Devices

For development, to access the app from other devices on your network:

1. Find your machine's IP address (e.g., `192.168.1.100`)
2. Update docker-compose.yml and add to NEXT_ALLOWED_DEV_ORIGINS
3. Access via `http://192.168.1.100:3000`

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, modify the port mapping in docker-compose files:

```yaml
ports:
  - "3001:3000" # Maps host port 3001 to container port 3000
```

### Volume Mount Issues

On Windows, ensure WSL2 is configured. On Mac/Linux, Docker should handle volumes automatically.

### Clean Rebuild

```bash
# Remove all containers, volumes, and networks
docker-compose down -v

# Rebuild from scratch
docker-compose up --build
```

### Check Container Logs

```bash
docker-compose logs app
```

## Performance Tips

- Use `.dockerignore` to exclude unnecessary files
- Development volumes are cached (node_modules, .next) for faster restarts
