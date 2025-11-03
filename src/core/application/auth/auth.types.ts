import * as Core from '@/core';
import { Keypair } from '@synonymdev/pubky';
import { LastReadResult } from 'pubky-app-specs';

export type TSecretKey = {
    secretKey: string;
}

export type TAuthenticateKeypairParams = Core.TSignUpParams & TSecretKey & { lastRead: LastReadResult };

export type THomeserverAuthenticateParams = {
    keypair: Keypair;
    secretKey: string;
}

export type TLogoutParams = {
    pubky: Core.Pubky;
    secretKey: string;
}