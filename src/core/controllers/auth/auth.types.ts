import { PublicKey } from '@synonymdev/pubky';

import * as Core from '@/core';

export type TPubkyParams = {
  pubky: Core.Pubky;
};

export type TAuthenticatedData = TPubkyParams & {
  session: Core.SignupResult['session'];
};
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
