import { env } from '@/lib/env';

export const DB_NAME = 'franky';
export const DB_VERSION = env.NEXT_PUBLIC_DB_VERSION;
export const SYNC_TTL = env.NEXT_PUBLIC_SYNC_TTL;
