import * as Core from '@/core';
import { LastReadResult } from 'pubky-app-specs';

export type TSecretKey = {
    secretKey: string;
}

export type TAuthenticateKeypairParams = Core.TSignUpParams & TSecretKey & { lastRead: LastReadResult };

export type THomeserverAuthenticateParams = Core.TKeypairParams & TSecretKey;

export type TLogoutParams = TSecretKey & {
    pubky: Core.Pubky;
}