import { z } from 'zod';
import { createCommonError, CommonErrorType } from '@/libs';

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

  NEXT_PUBLIC_TESTNET: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .default('false'),

  NEXT_PUBLIC_PKARR_RELAYS: z.string().default('https://pkarr.pubky.app'),

  NEXT_PUBLIC_HOMESERVER: z.string().default('ufibwbmed6jeq9k4p583go95wofakh9fwpp4k734trq79pd9u1uy'),

  NEXT_PUBLIC_HOMESERVER_ADMIN_URL: z.string().url().default('http://localhost:6288/generate_signup_token'),
  NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD: z.string().default('admin'),

  // Test environment variable (optional)
  VITEST: z.string().optional(),
});

/**
 * Parse and validate environment variables
 * Throws an error if validation fails
 */
function parseEnv(): z.infer<typeof envSchema> {
  try {
    const parsed = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_DB_VERSION: process.env.NEXT_PUBLIC_DB_VERSION,
      NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE,
      NEXT_PUBLIC_NEXUS_URL: process.env.NEXT_PUBLIC_NEXUS_URL,
      NEXT_PUBLIC_SYNC_TTL: process.env.NEXT_PUBLIC_SYNC_TTL,
      NEXT_PUBLIC_TESTNET: process.env.NEXT_PUBLIC_TESTNET,
      NEXT_PUBLIC_PKARR_RELAYS: process.env.NEXT_PUBLIC_PKARR_RELAYS,
      NEXT_PUBLIC_HOMESERVER: process.env.NEXT_PUBLIC_HOMESERVER,
      NEXT_PUBLIC_HOMESERVER_ADMIN_URL: process.env.NEXT_PUBLIC_HOMESERVER_ADMIN_URL,
      NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD: process.env.NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD,
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
export const Env = parseEnv();
