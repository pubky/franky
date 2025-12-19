# Environment Variables

This project uses Zod for environment variable validation to ensure type safety and provide sensible defaults.

## Configuration

All environment variables are validated in `src/libs/env/env.ts` using Zod schemas. This provides:

- **Type safety**: All env vars are properly typed
- **Validation**: Invalid values will cause startup errors
- **Defaults**: Sensible defaults for all variables
- **Documentation**: Clear indication of what each variable does

## Available Variables

### Database Configuration

- `NEXT_PUBLIC_DB_VERSION` (default: `1`)
  - Controls the IndexedDB database version
  - Must be a positive integer
  - Changing this will trigger database recreation

### Debug and Development

- `NEXT_PUBLIC_DEBUG_MODE` (default: `false`)
  - Enables debug logging throughout the application
  - Must be `"true"` or `"false"`
  - Only affects non-test environments

### Nexus Service

- `NEXT_PUBLIC_NEXUS_URL` (default: `"https://nexus.staging.pubky.app"`)
  - Base URL for the Nexus service API host
  - Must be a valid URL
  - API endpoints include their version in the literal path (e.g. `/v0/post/...`)

- `NEXT_PUBLIC_CDN_URL` (default: `"https://nexus.staging.pubky.app/static"`)
  - Base URL for static content delivery (e.g. avatars, images)
  - Must be a valid URL
  - Allows switching to a CDN or dedicated file server without changing Nexus API calls

### Sync Configuration

- `NEXT_PUBLIC_SYNC_TTL` (default: `300000`)
  - Time-to-live for sync operations in milliseconds
  - Must be a positive integer
  - Default is 5 minutes (300,000ms)

### Node Environment

- `NODE_ENV` (default: `"development"`)
  - Standard Node.js environment variable
  - Can be `"development"`, `"production"`, or `"test"`
  - Automatically set by Next.js

## Usage

### In Code

Instead of using `process.env` directly, import the validated environment:

```typescript
import { Env } from '@/libs';

// Type-safe and validated
const dbVersion = Env.NEXT_PUBLIC_DB_VERSION; // number
const debugMode = Env.NEXT_PUBLIC_DEBUG_MODE; // boolean
const nexusUrl = Env.NEXT_PUBLIC_NEXUS_URL; // string (validated URL)
const cdnUrl = Env.NEXT_PUBLIC_CDN_URL; // string (validated URL)
```

### Setting Variables

1. **Development**: Create a `.env.local` file in the project root
2. **Production**: Set environment variables in your deployment platform
3. **Testing**: Variables are set in `src/config/test.ts`

### Example .env.local

```bash
# Enable debug mode
NEXT_PUBLIC_DEBUG_MODE=true

# Use local Nexus instance
NEXT_PUBLIC_NEXUS_URL=http://localhost:3001

# Serve static assets locally
NEXT_PUBLIC_CDN_URL=http://localhost:3001/static

# Shorter sync TTL for development
NEXT_PUBLIC_SYNC_TTL=60000
```

## Validation Errors

If environment validation fails, you'll see detailed error messages:

```
❌ Environment validation failed:
  - NEXT_PUBLIC_DB_VERSION: Expected number, received string
  - NEXT_PUBLIC_NEXUS_URL: Invalid url
```

## Debug Information

In development mode with `NEXT_PUBLIC_DEBUG_MODE=true`, the environment configuration will be logged to the console on startup:

```
🔧 Environment Configuration:
┌─────────────┬─────────────────────────────────────────┐
│   (index)   │                 Values                  │
├─────────────┼─────────────────────────────────────────┤
│   NODE_ENV  │             'development'               │
│ DB_VERSION  │                    1                    │
│ DEBUG_MODE  │                  true                   │
│ NEXUS_URL   │     'https://nexus.staging.pubky.app' │
│  CDN_URL    │ 'https://nexus.staging.pubky.app/static' │
│  SYNC_TTL   │            '300000ms (300s)'            │
└─────────────┴─────────────────────────────────────────┘
```

## Benefits

- **Type Safety**: No more `process.env.SOME_VAR || 'default'` patterns
- **Validation**: Catch configuration errors at startup, not runtime
- **Documentation**: Clear indication of all available variables
- **Defaults**: Works out of the box without any configuration
- **IDE Support**: Full autocomplete and type checking for env vars
