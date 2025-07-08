import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { Keypair } from '@synonymdev/pubky';

// todo: auth state
export interface OnboardingState {
  publicKey: string;
  secretKey: Uint8Array | null;
  isGenerating: boolean;
  hasGenerated: boolean;
  hasHydrated: boolean;
}

export interface OnboardingActions {
  generateKeys: (force?: boolean) => void;
  clearKeys: () => void;
  clearSecretKeys: () => void;
  setPublicKey: (publicKey: string) => void;
  setGenerating: (isGenerating: boolean) => void;
  setHydrated: (hasHydrated: boolean) => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;

const initialState: OnboardingState = {
  publicKey: '',
  secretKey: new Uint8Array() || null,
  isGenerating: false,
  hasGenerated: false,
  hasHydrated: false,
};

export const useOnboardingStore = create<OnboardingStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        generateKeys: (force = false) => {
          const { isGenerating, secretKey } = get();

          // Check if we already have valid keys
          const hasValidKeys = secretKey && secretKey instanceof Uint8Array && secretKey.length === 32;

          // Prevent generation if already generating
          if (isGenerating) {
            return;
          }

          // If we have valid keys and not forcing, don't regenerate
          if (hasValidKeys && !force) {
            return;
          }

          set({ isGenerating: true });

          try {
            const keypair = Keypair.random();
            const secretKey = keypair.secretKey();
            const publicKey = keypair.publicKey();

            set({
              publicKey: publicKey.z32(),
              secretKey,
              hasGenerated: true,
              isGenerating: false,
            });
            // Also set the publicKey in the profile store
            // We need to import this dynamically to avoid circular dependencies
            import('../profile/profile.store').then(({ useProfileStore }) => {
              useProfileStore.getState().setCurrentUserPubky(publicKey.z32());
            });
          } catch (error) {
            console.error(error);
            set({ isGenerating: false });
          }
        },

        clearKeys: () => {
          set({ ...initialState, hasHydrated: true });
        },

        clearSecretKeys: () => {
          set({ ...get(), secretKey: null });
        },

        setPublicKey: (publicKey: string) => {
          set({ publicKey });

          // Also sync to profile store
          import('../profile/profile.store').then(({ useProfileStore }) => {
            const profileState = useProfileStore.getState();
            if (profileState.currentUserPubky !== publicKey) {
              // Only update if different to avoid infinite loops
              useProfileStore.getState().setCurrentUserPubky(publicKey);
            }
          });
        },

        setGenerating: (isGenerating: boolean) => {
          set({ isGenerating });
        },

        setHydrated: (hasHydrated: boolean) => {
          set({ hasHydrated });
        },
      }),
      {
        name: 'onboarding-storage',

        // Persist keys data
        partialize: (state) => ({
          publicKey: state.publicKey,
          secretKey: state.secretKey,
          hasGenerated: state.hasGenerated,
        }),

        // Custom storage to handle Uint8Array serialization with SSR safety
        storage: {
          getItem: (name) => {
            // Check if we're in a browser environment
            if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
              return null;
            }

            try {
              const str = localStorage.getItem(name);
              if (!str) return null;

              const parsed = JSON.parse(str);

              // Convert secretKey back to Uint8Array if it exists
              if (parsed.state && parsed.state.secretKey) {
                if (Array.isArray(parsed.state.secretKey)) {
                  parsed.state.secretKey = new Uint8Array(parsed.state.secretKey);
                } else {
                  // If it's not an array, it's corrupted
                  localStorage.removeItem(name);
                  return null;
                }
              }

              return parsed;
            } catch (error) {
              console.error(error);
              if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(name);
              }
              return null;
            }
          },
          setItem: (name, value) => {
            // Check if we're in a browser environment
            if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
              return;
            }

            try {
              // Convert Uint8Array to regular array for JSON serialization
              const toStore = { ...value };
              if (toStore.state && toStore.state.secretKey instanceof Uint8Array) {
                const stateWithSerializedKey = {
                  ...toStore.state,
                  secretKey: Array.from(toStore.state.secretKey),
                };
                toStore.state = stateWithSerializedKey as unknown as typeof toStore.state;
              }
              localStorage.setItem(name, JSON.stringify(toStore));
            } catch (error) {
              console.error(error);
            }
          },
          removeItem: (name) => {
            // Check if we're in a browser environment
            if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
              return;
            }
            localStorage.removeItem(name);
          },
        },

        onRehydrateStorage: () => {
          return (state, error) => {
            if (error) {
              // Use setTimeout to avoid circular reference
              setTimeout(() => {
                useOnboardingStore.getState().setHydrated(true);
              }, 0);
            } else if (state) {
              // Use setTimeout to avoid circular reference
              setTimeout(() => {
                useOnboardingStore.getState().setHydrated(true);

                // Sync publicKey to profile store if we have keys
                if (
                  state.publicKey ||
                  (state.secretKey && state.secretKey instanceof Uint8Array && state.secretKey.length === 32)
                ) {
                  import('../profile/profile.store').then(({ useProfileStore }) => {
                    const profileState = useProfileStore.getState();

                    // If we have publicKey in onboarding store, use it
                    if (state.publicKey) {
                      profileState.setCurrentUserPubky(state.publicKey);
                    }
                    // Otherwise, derive it from secretKey if available
                    else if (
                      state.secretKey &&
                      state.secretKey instanceof Uint8Array &&
                      state.secretKey.length === 32
                    ) {
                      try {
                        const keypair = Keypair.fromSecretKey(state.secretKey);
                        const publicKey = keypair.publicKey();
                        const publicKeyString = publicKey.z32();

                        // Update both stores
                        useOnboardingStore.getState().setPublicKey(publicKeyString);
                        profileState.setCurrentUserPubky(publicKeyString);
                      } catch (error) {
                        console.error('Failed to derive publicKey from secretKey:', error);
                      }
                    }
                  });
                }
              }, 0);
            } else {
              // No stored state, ensure clean initial state and mark as hydrated
              const cleanState = {
                ...initialState,
                hasHydrated: true,
              };

              // Use setTimeout to avoid circular reference
              setTimeout(() => {
                useOnboardingStore.setState(cleanState);
              }, 0);
            }
          };
        },
      },
    ),
    {
      name: 'Onboarding Store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);
