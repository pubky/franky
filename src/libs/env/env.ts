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
  NEXT_PUBLIC_DB_NAME: z.string().default('franky'),
  NEXT_PUBLIC_DB_VERSION: z
    .string()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),

  NEXT_PUBLIC_DEBUG_MODE: z
    .string()
    .default('false')
    .transform((val) => val === 'true')
    .pipe(z.boolean()),

  NEXT_PUBLIC_NEXUS_URL: z.string().url().default('https://nexus.staging.pubky.app'),
  NEXT_PUBLIC_CDN_URL: z.string().url().default('https://nexus.staging.pubky.app/static'),

  NEXT_PUBLIC_SYNC_TTL: z
    .string()
    .default('300000') // 5 minutes in milliseconds
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),

  NEXT_PUBLIC_NOTIFICATION_POLL_INTERVAL_MS: z
    .string()
    .default('8888') // 8888 milliseconds
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),

  NEXT_PUBLIC_NOTIFICATION_POLL_ON_START: z
    .string()
    .default('false')
    .transform((val) => val === 'true')
    .pipe(z.boolean()),

  NEXT_PUBLIC_NOTIFICATION_RESPECT_PAGE_VISIBILITY: z
    .string()
    .default('true')
    .transform((val) => val === 'true')
    .pipe(z.boolean()),

  NEXT_PUBLIC_STREAM_POLL_INTERVAL_MS: z
    .string()
    .default('8888') // 8888 milliseconds
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),

  NEXT_PUBLIC_STREAM_POLL_ON_START: z
    .string()
    .default('false')
    .transform((val) => val === 'true')
    .pipe(z.boolean()),

  NEXT_PUBLIC_STREAM_RESPECT_PAGE_VISIBILITY: z
    .string()
    .default('true')
    .transform((val) => val === 'true')
    .pipe(z.boolean()),

  NEXT_PUBLIC_STREAM_FETCH_LIMIT: z
    .string()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),

  NEXT_PUBLIC_STREAM_CACHE_MAX_AGE_MS: z
    .string()
    .default('300000') // 5 minutes in milliseconds
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),

  NEXT_PUBLIC_TESTNET: z
    .string()
    .default('false')
    .transform((val) => val === 'true')
    .pipe(z.boolean()),

  NEXT_MAX_STREAM_TAGS: z
    .string()
    .default('5')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),

  NEXT_PUBLIC_PKARR_RELAYS: z.string().default('https://pkarr.pubky.app'),

  NEXT_PUBLIC_HOMESERVER: z.string().default('ufibwbmed6jeq9k4p583go95wofakh9fwpp4k734trq79pd9u1uy'),

  NEXT_PUBLIC_HOMESERVER_ADMIN_URL: z.string().url().default('http://localhost:6288/generate_signup_token'),
  NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD: z.string().default('admin'),
  NEXT_PUBLIC_DEFAULT_HTTP_RELAY: z.string().url().default('https://relay.pubky.app'),

  NEXT_PUBLIC_MODERATION_ID: z.string().default('euwmq57zefw5ynnkhh37b3gcmhs7g3cptdbw1doaxj1pbmzp3wro'),
  NEXT_PUBLIC_MODERATED_TAGS: z
    .string()
    .default('["nudity"]')
    .transform((val) => JSON.parse(val))
    .pipe(z.array(z.string().min(1)).min(1)),

  // Test environment variable (optional)
  VITEST: z.string().optional(),

  // Server-side Chatwoot configuration (optional in schema, validated at runtime when service is used)
  // These are server-side only and not available in browser, so we make them optional here
  // but ChatwootService.getConfig() will validate they exist when actually needed
  BASE_URL_SUPPORT: z.string().url().optional(),
  SUPPORT_API_ACCESS_TOKEN: z.string().min(1).optional(),
  SUPPORT_ACCOUNT_ID: z.string().min(1).optional(),
  SUPPORT_FEEDBACK_INBOX_ID: z
    .string()
    .min(1)
    .optional()
    .default('26')
    .transform((val) => parseInt(val, 10)),

  NEXT_PUBLIC_PREVIEW_IMAGE: z.string().optional().default('/preview.png'),
  NEXT_PUBLIC_SITE_NAME: z.string().optional().default('Pubky App'),
  NEXT_PUBLIC_LOCALE: z.string().optional().default('en_US'),
  NEXT_PUBLIC_AUTHOR: z.string().optional().default('Pubky Team'),
  NEXT_PUBLIC_KEYWORDS: z.string().optional().default('pubky, social media, decentralized, key, pkarr, pubky core'),
  NEXT_PUBLIC_TYPE: z.string().optional().default('website'),
  NEXT_PUBLIC_CREATOR: z.string().optional().default('@getpubky'),
  NEXT_PUBLIC_DEFAULT_URL: z.string().optional().default('https://pubky.app'),

  // external links
  NEXT_PUBLIC_PUBKY_RING_URL: z.string().optional().default('https://pubkyring.app/'),
  NEXT_PUBLIC_PUBKY_CORE_URL: z.string().optional().default('https://pubky.org'),
  NEXT_PUBLIC_TWITTER_URL: z.string().optional().default('https://x.com/pubky'),
  NEXT_PUBLIC_TWITTER_GETPUBKY_URL: z.string().optional().default('https://x.com/getpubky'),
  NEXT_PUBLIC_TELEGRAM_URL: z.string().optional().default('https://t.me/pubkychat'),
  NEXT_PUBLIC_GITHUB_URL: z.string().optional().default('https://github.com/pubky'),
  NEXT_PUBLIC_EMAIL: z.string().optional().default('hello@pubky.com'),
  NEXT_PUBLIC_APP_STORE_URL: z.string().optional().default('https://apps.apple.com/app/pubky-ring/id6739356756'),
  NEXT_PUBLIC_PLAY_STORE_URL: z
    .string()
    .optional()
    .default('https://play.google.com/store/apps/details?id=to.pubky.ring&pcampaignid=web_share'),
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
      NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
      NEXT_PUBLIC_SYNC_TTL: process.env.NEXT_PUBLIC_SYNC_TTL,
      NEXT_PUBLIC_NOTIFICATION_POLL_INTERVAL_MS: process.env.NEXT_PUBLIC_NOTIFICATION_POLL_INTERVAL_MS,
      NEXT_PUBLIC_NOTIFICATION_POLL_ON_START: process.env.NEXT_PUBLIC_NOTIFICATION_POLL_ON_START,
      NEXT_PUBLIC_NOTIFICATION_RESPECT_PAGE_VISIBILITY: process.env.NEXT_PUBLIC_NOTIFICATION_RESPECT_PAGE_VISIBILITY,
      NEXT_MAX_STREAM_TAGS: process.env.NEXT_MAX_STREAM_TAGS,
      NEXT_PUBLIC_STREAM_POLL_INTERVAL_MS: process.env.NEXT_PUBLIC_STREAM_POLL_INTERVAL_MS,
      NEXT_PUBLIC_STREAM_POLL_ON_START: process.env.NEXT_PUBLIC_STREAM_POLL_ON_START,
      NEXT_PUBLIC_STREAM_RESPECT_PAGE_VISIBILITY: process.env.NEXT_PUBLIC_STREAM_RESPECT_PAGE_VISIBILITY,
      NEXT_PUBLIC_STREAM_FETCH_LIMIT: process.env.NEXT_PUBLIC_STREAM_FETCH_LIMIT,
      NEXT_PUBLIC_STREAM_CACHE_MAX_AGE_MS: process.env.NEXT_PUBLIC_STREAM_CACHE_MAX_AGE_MS,
      NEXT_PUBLIC_TESTNET: process.env.NEXT_PUBLIC_TESTNET,
      NEXT_PUBLIC_PKARR_RELAYS: process.env.NEXT_PUBLIC_PKARR_RELAYS,
      NEXT_PUBLIC_HOMESERVER: process.env.NEXT_PUBLIC_HOMESERVER,
      NEXT_PUBLIC_HOMESERVER_ADMIN_URL: process.env.NEXT_PUBLIC_HOMESERVER_ADMIN_URL,
      NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD: process.env.NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD,
      NEXT_PUBLIC_DEFAULT_HTTP_RELAY: process.env.NEXT_PUBLIC_DEFAULT_HTTP_RELAY,
      NEXT_PUBLIC_MODERATION_ID: process.env.NEXT_PUBLIC_MODERATION_ID,
      NEXT_PUBLIC_MODERATED_TAGS: process.env.NEXT_PUBLIC_MODERATED_TAGS,
      VITEST: process.env.VITEST,
      BASE_URL_SUPPORT: process.env.BASE_URL_SUPPORT,
      SUPPORT_API_ACCESS_TOKEN: process.env.SUPPORT_API_ACCESS_TOKEN,
      SUPPORT_ACCOUNT_ID: process.env.SUPPORT_ACCOUNT_ID,
      SUPPORT_FEEDBACK_INBOX_ID: process.env.SUPPORT_FEEDBACK_INBOX_ID,
      NEXT_PUBLIC_PREVIEW_IMAGE: process.env.NEXT_PUBLIC_PREVIEW_IMAGE,
      NEXT_PUBLIC_DEFAULT_URL: process.env.NEXT_PUBLIC_DEFAULT_URL,
      NEXT_PUBLIC_LOCALE: process.env.NEXT_PUBLIC_LOCALE,
      NEXT_PUBLIC_AUTHOR: process.env.NEXT_PUBLIC_AUTHOR,
      NEXT_PUBLIC_KEYWORDS: process.env.NEXT_PUBLIC_KEYWORDS,
      NEXT_PUBLIC_TYPE: process.env.NEXT_PUBLIC_TYPE,
      NEXT_PUBLIC_CREATOR: process.env.NEXT_PUBLIC_CREATOR,
      NEXT_PUBLIC_PUBKY_RING_URL: process.env.NEXT_PUBLIC_PUBKY_RING_URL,
      NEXT_PUBLIC_PUBKY_CORE_URL: process.env.NEXT_PUBLIC_PUBKY_CORE_URL,
      NEXT_PUBLIC_TWITTER_URL: process.env.NEXT_PUBLIC_TWITTER_URL,
      NEXT_PUBLIC_TWITTER_GETPUBKY_URL: process.env.NEXT_PUBLIC_TWITTER_GETPUBKY_URL,
      NEXT_PUBLIC_TELEGRAM_URL: process.env.NEXT_PUBLIC_TELEGRAM_URL,
      NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
      NEXT_PUBLIC_EMAIL_URL: process.env.NEXT_PUBLIC_EMAIL_URL,
      NEXT_PUBLIC_APP_STORE_URL: process.env.NEXT_PUBLIC_APP_STORE_URL,
      NEXT_PUBLIC_PLAY_STORE_URL: process.env.NEXT_PUBLIC_PLAY_STORE_URL,
    });

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.reduce(
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
