import * as Core from '@/core';

export interface OnboardingState {
  pubky: Core.Pubky;
  secretKey: string;
  mnemonic: string;
  hasHydrated: boolean;
  showWelcomeDialog: boolean;
}

export interface OnboardingActions {
  reset: () => void;
  setPubky: (pubky: Core.Pubky) => void;
  setSecretKey: (secretKey: string) => void;
  setMnemonic: (mnemonic: string) => void;
  setKeypair: (pubky: Core.Pubky, secretKey: string) => void;
  setKeypairFromMnemonic: (mnemonic: string) => void;
  clearSecrets: () => void;
  setHydrated: (hasHydrated: boolean) => void;
  setShowWelcomeDialog: (show: boolean) => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;

export const onboardingInitialState: OnboardingState = {
  pubky: '' as Core.Pubky,
  secretKey: '',
  mnemonic: '',
  hasHydrated: false,
  showWelcomeDialog: false,
};

export enum OnboardingActionTypes {
  RESET = 'RESET',
  CLEAR_SECRETS = 'CLEAR_SECRETS',
  SET_SECRET_KEY = 'SET_SECRET_KEY',
  SET_PUBKY = 'SET_PUBKY',
  SET_MNEMONIC = 'SET_MNEMONIC',
  SET_KEYPAIR = 'SET_KEYPAIR',
  SET_KEYPAIR_FROM_MNEMONIC = 'SET_KEYPAIR_FROM_MNEMONIC',
  SET_HYDRATED = 'SET_HYDRATED',
  SET_SHOW_WELCOME_DIALOG = 'SET_SHOW_WELCOME_DIALOG',
}
