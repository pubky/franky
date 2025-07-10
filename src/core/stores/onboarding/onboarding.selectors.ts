import type { OnboardingStore } from '@/core';

// WRONG: That selector has to be depending of the component needs, not the store needs
// e.g. If a component needs three values, that one could be one of the candidates to create a new selector
// bikeshed all the components and reimplement all the selectors. Only implement the ones that are needed

// Or it might be useful for the actions, but I think actions already has the access to the store
export const getPublicKey = (state: OnboardingStore) => state.publicKey;
export const getSecretKey = (state: OnboardingStore) => state.secretKey;
export const getIsGenerating = (state: OnboardingStore) => state.isGenerating;
export const getHasGenerated = (state: OnboardingStore) => state.hasGenerated;
export const getHasHydrated = (state: OnboardingStore) => state.hasHydrated;
export const getIsBackedUp = (state: OnboardingStore) => state.isBackedUp;

// Computed selectors - Derived state
export const getHasValidKeys = (state: OnboardingStore) => {
  const { secretKey } = state;
  return secretKey && secretKey.length === 64;
};

export const getIsReady = (state: OnboardingStore) => {
  return state.hasHydrated && !state.isGenerating;
};

export const getCanGenerateKeys = (state: OnboardingStore) => {
  return !state.isGenerating;
};

// Legacy object export for backward compatibility (can be removed later)
export const onboardingSelectors = {
  getPublicKey,
  getSecretKey,
  getIsGenerating,
  getHasGenerated,
  getHasHydrated,
  getHasValidKeys,
  getIsReady,
  getCanGenerateKeys,
  getIsBackedUp,
};
