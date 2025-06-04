import type { Session } from '@synonymdev/pubky';

export type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: string;
  credentials?: 'include' | 'omit';
};

export type SignupResult = {
  session: Session;
};

export type KeyPair = {
  publicKey: string;
  secretKey: string;
};
