import { logger } from '@/lib/logger';

// Get database version from environment variable
export const DB_VERSION = Number(process.env.NEXT_PUBLIC_VERSION_DB) || 1;

if (!process.env.NEXT_PUBLIC_VERSION_DB) {
  logger.warn('NEXT_PUBLIC_VERSION_DB is not defined in .env file. Using default version 1');
}

export const DB_NAME = 'FrankyDB'; 