import * as Identity from '@/libs/identity';
import { Keypair } from '@synonymdev/pubky';

export interface OnboardingState {
  keypair: Keypair | null;
  mnemonic: string | null;
  hasHydrated: boolean;
  showWelcomeDialog: boolean;
}

export interface OnboardingActions {
  reset: () => void;
  setMnemonic: (mnemonic: Identity.TMnemonicWords) => void;
  setKeypair: (keypair: Keypair) => void;
  clearSecrets: () => void;
  setHydrated: (hasHydrated: boolean) => void;
  setShowWelcomeDialog: (show: boolean) => void;
}

export interface OnboardingSelectors {
  selectSecretKey: () => string;
  selectPublicKey: () => string;
  selectMnemonic: () => string;
}

export type OnboardingStore = OnboardingState & OnboardingActions & OnboardingSelectors;

export const onboardingInitialState: OnboardingState = {
  keypair: null,
  mnemonic: null,
  hasHydrated: false,
  showWelcomeDialog: false,
};

export enum OnboardingActionTypes {
  RESET = 'RESET',
  CLEAR_SECRETS = 'CLEAR_SECRETS',
  SET_KEYPAIR = 'SET_KEYPAIR',
  SET_MNEMONIC = 'SET_MNEMONIC',
  SET_KEYPAIR_FROM_MNEMONIC = 'SET_KEYPAIR_FROM_MNEMONIC',
  SET_HYDRATED = 'SET_HYDRATED',
  SET_SHOW_WELCOME_DIALOG = 'SET_SHOW_WELCOME_DIALOG',
}
