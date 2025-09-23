import { SYNC_TTL } from '@/config';

export const DEFAULT_USER_TTL = {
  id: '',
  ttl: Date.now() + SYNC_TTL,
};
