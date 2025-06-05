import { env } from '@/libs/env/env';

export const IS_DEBUG = env.NEXT_PUBLIC_DEBUG_MODE;
export const IS_TEST = env.NODE_ENV === 'test' || Boolean(env.VITEST);
