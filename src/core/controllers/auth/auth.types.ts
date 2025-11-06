import { PublicKey, Keypair } from '@synonymdev/pubky';

import * as Core from '@/core';

export type TPubkyParams = {
  pubky: Core.Pubky;
};

export type TAuthenticatedData = TPubkyParams & {
  session: Core.SignupResult['session'];
};
export type TKeypairParams = {
  keypair: Keypair;
};
export type TSignUpParams = {
  keypair: Core.TKeyPair;
  signupToken: string;
};
export type TLoginWithMnemonicParams = {
  mnemonic: string;
};
export type TLoginWithEncryptedFileParams = {
  encryptedFile: File;
  password: string;
};
export type TLoginWithAuthUrlParams = {
  publicKey: PublicKey;
};
