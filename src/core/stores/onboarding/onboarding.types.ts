export interface OnboardingState {
  isBackedUp: boolean;
  publicKey: string;
  secretKey: string;
  mnemonic: string;
  hasHydrated: boolean;
}

export interface OnboardingActions {
  reset: () => void;
  setPublicKey: (publicKey: string) => void;
  setSecretKey: (secretKey: string) => void;
  setMnemonic: (mnemonic: string) => void;
  setKeypair: (publicKey: string, secretKey: string) => void;
  setKeypairFromMnemonic: (mnemonic: string) => void;
  setHydrated: (hasHydrated: boolean) => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;

export const onboardingInitialState: OnboardingState = {
  isBackedUp: false,
  publicKey: '',
  secretKey: '',
  mnemonic: '',
  hasHydrated: false,
};

export enum OnboardingActionTypes {
  RESET = 'RESET',
  CLEAR_SECRET_KEY = 'CLEAR_SECRET_KEY',
  SET_SECRET_KEY = 'SET_SECRET_KEY',
  SET_PUBLIC_KEY = 'SET_PUBLIC_KEY',
  SET_MNEMONIC = 'SET_MNEMONIC',
  SET_KEYPAIR = 'SET_KEYPAIR',
  SET_KEYPAIR_FROM_MNEMONIC = 'SET_KEYPAIR_FROM_MNEMONIC',
  SET_HYDRATED = 'SET_HYDRATED',
}
