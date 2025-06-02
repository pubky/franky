import { z } from 'zod';
import { createCommonError, CommonErrorType } from './error';
import { logger } from './logger';

/**
 * Environment Variables Schema with Zod validation
 *
 * This file validates all environment variables and provides type-safe defaults.
 * All variables are validated at startup to catch configuration errors early.
 */

// Schema for environment variables
const envSchema = z.object({
  // Node.js environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Next.js public environment variables
  NEXT_PUBLIC_DB_VERSION: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .default('1')
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val)),

  NEXT_PUBLIC_DEBUG_MODE: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .default('false')
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),

  NEXT_PUBLIC_NEXUS_URL: z.string().url().default('https://nexus.staging.pubky.app/v0'),

  NEXT_PUBLIC_SYNC_TTL: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .default('300000') // 5 minutes in milliseconds
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val)),

  // Test environment variable (optional)
  VITEST: z.string().optional(),
});

// Type for validated environment
export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 * Throws an error if validation fails
 */
function parseEnv(): Env {
  try {
    const parsed = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_DB_VERSION: process.env.NEXT_PUBLIC_DB_VERSION,
      NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE,
      NEXT_PUBLIC_NEXUS_URL: process.env.NEXT_PUBLIC_NEXUS_URL,
      NEXT_PUBLIC_SYNC_TTL: process.env.NEXT_PUBLIC_SYNC_TTL,
      VITEST: process.env.VITEST,
    });

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.reduce(
        (acc, err) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        },
        {} as Record<string, string>,
      );

      throw createCommonError(
        CommonErrorType.ENV_VALIDATION_ERROR,
        'Environment configuration validation failed',
        500,
        { details },
      );
    }

    throw createCommonError(CommonErrorType.ENV_TYPE_ERROR, 'Unexpected error during environment configuration', 500, {
      error,
    });
  }
}

/**
 * Validated environment variables with defaults applied
 * Use this instead of process.env directly
 */
export const env = parseEnv();

/**
 * Development helper to log current environment
 */
export function logEnvironment(): void {
  if (env.NEXT_PUBLIC_DEBUG_MODE) {
    logger.info('Environment Configuration:', {
      NODE_ENV: env.NODE_ENV,
      DB_VERSION: env.NEXT_PUBLIC_DB_VERSION,
      DEBUG_MODE: env.NEXT_PUBLIC_DEBUG_MODE,
      NEXUS_URL: env.NEXT_PUBLIC_NEXUS_URL,
      SYNC_TTL: `${env.NEXT_PUBLIC_SYNC_TTL}ms (${env.NEXT_PUBLIC_SYNC_TTL / 1000}s)`,
    });
  }
}

// Log environment on import in development
if (typeof window === 'undefined' && env.NODE_ENV === 'development') {
  logEnvironment();
}
