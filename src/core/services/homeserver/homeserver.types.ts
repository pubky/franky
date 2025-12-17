import type { AuthFlow, Session } from '@synonymdev/pubky';

import * as Core from '@/core';

export type FetchOptions = {
  method?: HomeserverAction;
  body?: string | Uint8Array;
};

export type THomeserverSignUpParams = Core.TKeypairParams & {
  signupToken: string;
};

export type THomeserverSessionResult = {
  session: Session;
};

export type TGenerateAuthUrlResult = {
  authorizationUrl: string;
  awaitApproval: Promise<Session>;
  authFlow: AuthFlow;
};

export enum HomeserverAction {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
