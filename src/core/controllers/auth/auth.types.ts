import { PublicKey, Keypair } from '@synonymdev/pubky';

import * as Core from '@/core';

export interface TPubkyParams {
  pubky: Core.Pubky;
}

export interface TAuthenticatedData extends TPubkyParams {
  session: Core.SignupResult['session'];
}

export interface TKeypairParams {
  keypair: Keypair;
}

export interface TSignUpParams {
  keypair: Core.TKeyPair;
  signupToken: string;
}

export interface TLoginWithMnemonicParams {
  mnemonic: string;
}

export interface TLoginWithEncryptedFileParams {
  encryptedFile: File;
  password: string;
}

export interface TLoginWithAuthUrlParams {
  publicKey: PublicKey;
}

export interface TBootstrapResponse {
  notification: Core.NotificationState;
}
