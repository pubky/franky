import type { Keypair, Session } from '@synonymdev/pubky';

export type FetchOptions = {
  method?: HomeserverAction;
  body?: string | Uint8Array;
};

export type TKeypairParams = {
  keypair: Keypair;
};

export type THomeserverSignUpParams = TKeypairParams & {
  signupToken: string;
};

export type THomeserverSessionResult = {
  session: Session;
};

export type TGenerateAuthUrlResult = {
  authorizationUrl: string;
  awaitApproval: Promise<Session>;
};

export enum HomeserverAction {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
