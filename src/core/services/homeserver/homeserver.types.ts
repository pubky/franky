import type { Session } from '@synonymdev/pubky';
import * as Core from '@/core';

export type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: string | Uint8Array;
};

export type SignupResult = {
  session: Session;
};

export type TKeyPair = {
  pubky: Core.Pubky;
  secretKey: string;
};

export type TAuthenticateKeypairResult = {
  pubky: Core.Pubky;
  session: Session;
};

export enum HomeserverAction {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
