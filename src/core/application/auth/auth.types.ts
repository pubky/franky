import * as Core from '@/core';

export type TSecretKey = {
  secretKey: string;
};

export type TAuthenticateKeypairParams = Core.TSignUpParams & TSecretKey;

export type THomeserverAuthenticateParams = Core.TKeypairParams & TSecretKey;

export type TLogoutParams = TSecretKey & {
  pubky: Core.Pubky;
};
