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

export type CancelableAuthApproval = {
  awaitApproval: Promise<Session>;
  cancel: () => void;
};

/**
 * Type alias for pub path pattern.
 * Represents paths that start with '/pub/' followed by any string.
 *
 * @example
 * ```typescript
 * const validPath: PubPath<string> = '/pub/user/profile';
 * const validPath2: PubPath<string> = '/pub/pubky.app/:rw';
 * ```
 */
export type PubPath<T extends string = string> = `/pub/${T}`;