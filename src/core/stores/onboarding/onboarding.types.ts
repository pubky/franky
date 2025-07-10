export interface OnboardingState {
  isBackedUp: boolean;
  publicKey: string;
  secretKey: string;
  isGenerating: boolean;
  hasGenerated: boolean;
  hasHydrated: boolean;
}

export interface OnboardingActions {
  reset: () => void;
  setPublicKey: (publicKey: string) => void;
  setSecretKey: (secretKey: string) => void;
  setGenerating: (isGenerating: boolean) => void;
  setHydrated: (hasHydrated: boolean) => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;

export const onboardingInitialState: OnboardingState = {
  isBackedUp: false,
  publicKey: '',
  secretKey: '',
  isGenerating: false,
  hasGenerated: false,
  hasHydrated: false,
};

export enum OnboardingActionTypes {
  RESET = 'RESET',
  CLEAR_SECRET_KEY = 'CLEAR_SECRET_KEY',
  SET_SECRET_KEY = 'SET_SECRET_KEY',
  SET_PUBLIC_KEY = 'SET_PUBLIC_KEY',
  SET_GENERATING = 'SET_GENERATING',
  SET_HYDRATED = 'SET_HYDRATED',
}
