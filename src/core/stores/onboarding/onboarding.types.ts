export interface OnboardingState {
  secretKey: string | null;
  mnemonic: string | null;
  hasHydrated: boolean;
  showWelcomeDialog: boolean;
  inviteCode: string;
}

/**
 * A pair of secret key and mnemonic
 */
export interface TOnboardingSecrets {
  secretKey: string;
  mnemonic: string;
}

export interface OnboardingActions {
  reset: () => void;
  setInviteCode: (inviteCode: string) => void;
  setSecrets: (secrets: TOnboardingSecrets) => void;
  clearSecrets: () => void;
  setHydrated: (hasHydrated: boolean) => void;
  setShowWelcomeDialog: (show: boolean) => void;
}

export interface OnboardingSelectors {
  selectSecretKey: () => string;
  selectMnemonic: () => string;
}

export type OnboardingStore = OnboardingState & OnboardingActions & OnboardingSelectors;

export const onboardingInitialState: OnboardingState = {
  secretKey: null,
  mnemonic: null,
  hasHydrated: false,
  showWelcomeDialog: false,
  inviteCode: '',
};

export enum OnboardingActionTypes {
  RESET = 'RESET',
  SET_SECRETS = 'SET_SECRETS',
  CLEAR_SECRETS = 'CLEAR_SECRETS',
  SET_HYDRATED = 'SET_HYDRATED',
  SET_SHOW_WELCOME_DIALOG = 'SET_SHOW_WELCOME_DIALOG',
  SET_INVITE_CODE = 'SET_INVITE_CODE',
  SET_SECRET_KEY = 'SET_SECRET_KEY',
  SET_MNEMONIC = 'SET_MNEMONIC',
  SET_KEYPAIR_FROM_MNEMONIC = 'SET_KEYPAIR_FROM_MNEMONIC',
}
