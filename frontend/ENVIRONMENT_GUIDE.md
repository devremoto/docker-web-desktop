# Environment Variables Configuration Guide

## 📋 Overview

This Vue.js application supports three different environment configurations:

- **Development** (`.env`) - Local development
- **Production** (`.env.production`) - Production deployment  
- **Docker** (`.env.docker`) - Docker container deployment

## 🔧 Environment Files

### `.env` (Development)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=Docker Web Desktop
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
VITE_SOCKET_URL=http://localhost:3000
VITE_LOG_LEVEL=debug
```

### `.env.production` (Production)
```env
VITE_API_BASE_URL=https://your-production-api.com
VITE_APP_TITLE=Docker Web Desktop
VITE_APP_VERSION=1.0.0
VITE_DEBUG=false
VITE_SOCKET_URL=https://your-production-api.com
VITE_LOG_LEVEL=error
```

### `.env.docker` (Docker)
```env
VITE_API_BASE_URL=http://backend:3000
VITE_APP_TITLE=Docker Web Desktop
VITE_APP_VERSION=1.0.0
VITE_DEBUG=false
VITE_SOCKET_URL=http://backend:3000
VITE_LOG_LEVEL=warn
```

## 🚀 Usage Commands

### Development
```bash
npm run dev                 # Uses .env
npm run build              # Uses .env for development build
```

### Production
```bash
npm run build:production   # Uses .env.production
npm run preview:production # Preview production build
```

### Docker
```bash
npm run dev:docker         # Uses .env.docker for development
npm run build:docker       # Uses .env.docker for build
npm run preview:docker     # Preview docker build
```

## 📝 Available Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000` |
| `VITE_APP_TITLE` | Application title | `Docker Web Desktop` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |
| `VITE_DEBUG` | Enable debug logging | `false` |
| `VITE_SOCKET_URL` | Socket.IO server URL | Same as API URL |
| `VITE_LOG_LEVEL` | Logging level | `info` |

## 💻 TypeScript Support

Environment variables are fully typed in `src/env.d.ts`:

```typescript
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_DEBUG: string
  readonly VITE_SOCKET_URL: string
  readonly VITE_LOG_LEVEL: string
}
```

## 🛠️ Usage in Code

### Direct Access
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL
const debug = import.meta.env.VITE_DEBUG === 'true'
```

### Using Environment Utility
```typescript
import Environment from '@/utils/environment'

// Get configuration
const config = Environment.config
console.log(config.apiBaseUrl)

// Logging with environment-aware levels
Environment.debug('Debug message')
Environment.info('Info message')
Environment.warn('Warning message')
Environment.error('Error message')

// Environment checks
if (Environment.isDevelopment) {
  // Development-only code
}

if (Environment.isProduction) {
  // Production-only code
}
```

## 🐳 Docker Configuration

When building for Docker, the application expects the backend to be accessible at `http://backend:3000`. Make sure your Docker Compose or container setup uses the correct service names.

Example `docker-compose.yml`:
```yaml
services:
  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
  
  backend:
    # Your backend configuration
    ports:
      - "3000:3000"
```

## 🔍 Environment Detection

The application can detect its environment:

```typescript
import Environment from '@/utils/environment'

console.log('Current mode:', Environment.mode)
console.log('Is development:', Environment.isDevelopment)
console.log('Is production:', Environment.isProduction)
```

## 🎯 Best Practices

1. **Never commit sensitive data** to environment files
2. **Use different API URLs** for different environments
3. **Enable debug only in development**
4. **Set appropriate log levels** for each environment
5. **Use TypeScript** for environment variable type safety

## 🔒 Security Notes

- Environment variables starting with `VITE_` are exposed to the client
- Never put secrets or sensitive data in these files
- Use server-side environment variables for sensitive configuration

## 🆘 Troubleshooting

### Issue: Environment variables not loading
**Solutions:**
1. Ensure variable names start with `VITE_`
2. Restart the dev server after changes
3. Check file naming (`.env.production`, not `.env-production`)

### Issue: Wrong environment being used
**Solutions:**
1. Use the correct npm script for your target environment
2. Check that the `.env` file exists for the target mode
3. Verify the `--mode` flag in package.json scripts