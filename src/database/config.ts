import { logger } from '@/lib/logger';

// Get database version from environment variable
export const DB_VERSION = Number(process.env.NEXT_PUBLIC_DB_VERSION) || 1;

if (!process.env.NEXT_PUBLIC_DB_VERSION) {
  logger.warn('NEXT_PUBLIC_DB_VERSION is not defined in .env file. Using default version 1');
}

// Default is 5 minutes in milliseconds
export const SYNC_TTL = process.env.NEXT_PUBLIC_SYNC_TTL ? parseInt(process.env.NEXT_PUBLIC_SYNC_TTL) : 60 * 5 * 1000;

export const DB_NAME = 'FrankyDB';
