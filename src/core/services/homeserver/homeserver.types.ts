import type { Session } from '@synonymdev/pubky';

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
  cancelAuthFlow: () => void;
};

export enum HomeserverAction {
  GET = 'GET',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export type THomeserverRestoreSessionParams = {
  sessionExport: string;
};