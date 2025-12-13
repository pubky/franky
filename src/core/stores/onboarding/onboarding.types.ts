export interface OnboardingState {
  secretKey: string | null;
  mnemonic: string | null;
  hasHydrated: boolean;
  showWelcomeDialog: boolean;
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
};

export enum OnboardingActionTypes {
  RESET = 'RESET',
  SET_SECRETS = 'SET_SECRETS',
  CLEAR_SECRETS = 'CLEAR_SECRETS',
  SET_HYDRATED = 'SET_HYDRATED',
  SET_SHOW_WELCOME_DIALOG = 'SET_SHOW_WELCOME_DIALOG',
}
