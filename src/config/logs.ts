import { Env } from '@/libs';

export const IS_DEBUG = Env.NEXT_PUBLIC_DEBUG_MODE;
export const IS_TEST = Env.NODE_ENV === 'test' || Boolean(Env.VITEST);
