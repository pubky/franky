import type { Session } from '@synonymdev/pubky';

export type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: string | Uint8Array;
};

export type SignupResult = {
  session: Session;
};

export type TKeyPair = {
  publicKey: string;
  secretKey: string;
};
