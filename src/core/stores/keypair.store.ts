/**
 * Keypair Store
 *
 * Global state management for cryptographic keypairs and homeserver sessions using Zustand.
 * Handles key generation, persistence, session management, and loading states.
 *
 * Features:
 * - Automatic key generation prevention (no double generation)
 * - Persistent storage (keys and sessions survive page refreshes)
 * - Loading states for better UX
 * - Error handling for key generation failures
 * - Comprehensive logging for debugging and monitoring
 * - Storage rehydration tracking
 * - Proper Uint8Array serialization/deserialization
 * - Homeserver session management
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { Keypair } from '@synonymdev/pubky';
import { Logger } from '@/libs/logger';
import { type SignupResult } from '@/core';

export interface KeypairState {
  publicKey: string;
  secretKey: Uint8Array;
  isGenerating: boolean;
  hasGenerated: boolean;
  hasHydrated: boolean;
  // Session management
  session: SignupResult['session'] | null;
  isAuthenticated: boolean;
}

export interface KeypairActions {
  generateKeys: (force?: boolean) => void;
  clearKeys: () => void;
  setGenerating: (isGenerating: boolean) => void;
  setHydrated: (hasHydrated: boolean) => void;
  // Session management
  setSession: (session: SignupResult['session'] | null) => void;
  clearSession: () => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
}

export type KeypairStore = KeypairState & KeypairActions;

const initialState: KeypairState = {
  publicKey: '',
  secretKey: new Uint8Array(),
  isGenerating: false,
  hasGenerated: false,
  hasHydrated: false,
  session: null,
  isAuthenticated: false,
};

export const useKeypairStore = create<KeypairStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        generateKeys: (force = false) => {
          const { hasGenerated, isGenerating, secretKey } = get();

          // Check if we already have valid keys
          const hasValidKeys = secretKey && secretKey instanceof Uint8Array && secretKey.length === 32;

          Logger.info('KeypairStore: generateKeys called', {
            hasGenerated,
            force,
            isGenerating,
            hasValidKeys,
            secretKeyLength: secretKey?.length,
          });

          // Prevent generation if already generating
          if (isGenerating) {
            Logger.warn('KeypairStore: Generation already in progress');
            return;
          }

          // If we have valid keys and not forcing, don't regenerate
          if (hasValidKeys && !force) {
            Logger.info('KeypairStore: Valid keys already exist, skipping generation');
            return;
          }

          if (force && hasGenerated) {
            Logger.info('KeypairStore: Force regenerating existing keys');
          }

          Logger.debug('KeypairStore: Starting key generation process', { force });
          set({ isGenerating: true });

          try {
            Logger.debug('KeypairStore: Generating new keypair');

            const keypair = Keypair.random();
            const publicKey = keypair.publicKey().z32();
            const secretKey = keypair.secretKey();

            Logger.info('KeypairStore: Keys generated successfully', {
              publicKeyLength: publicKey.length,
              secretKeyLength: secretKey.length,
              secretKeyType: secretKey.constructor.name,
            });

            // Small delay to show the loading state
            setTimeout(() => {
              set({
                publicKey,
                secretKey,
                hasGenerated: true,
                isGenerating: false,
              });
              Logger.info('KeypairStore: Keys stored in state successfully');
            }, 200);
          } catch (error) {
            Logger.error('KeypairStore: Failed to generate keys', error);
            set({ isGenerating: false });
          }
        },

        clearKeys: () => {
          Logger.info('KeypairStore: Clearing all keys and resetting state');
          set({ ...initialState, hasHydrated: true });
          Logger.debug('KeypairStore: State reset to initial values');
        },

        setGenerating: (isGenerating: boolean) => {
          Logger.debug('KeypairStore: Setting generating state', { isGenerating });
          set({ isGenerating });
        },

        setHydrated: (hasHydrated: boolean) => {
          Logger.debug('KeypairStore: Setting hydrated state', { hasHydrated });
          set({ hasHydrated });
        },

        setSession: (session: SignupResult['session'] | null) => {
          Logger.debug('KeypairStore: Setting session', { hasSession: !!session });
          set({
            session,
            isAuthenticated: !!session,
          });
        },

        clearSession: () => {
          Logger.info('KeypairStore: Clearing session');
          set({
            session: null,
            isAuthenticated: false,
          });
        },

        setAuthenticated: (isAuthenticated: boolean) => {
          Logger.debug('KeypairStore: Setting authenticated state', { isAuthenticated });
          set({ isAuthenticated });
        },
      }),
      {
        name: 'keypair-storage',

        // Persist keys and session data
        partialize: (state) => ({
          publicKey: state.publicKey,
          secretKey: state.secretKey,
          hasGenerated: state.hasGenerated,
          session: state.session,
          isAuthenticated: state.isAuthenticated,
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
                  Logger.warn('KeypairStore: Corrupted secretKey detected in storage, clearing');
                  localStorage.removeItem(name);
                  return null;
                }
              }

              return parsed;
            } catch (error) {
              Logger.error('KeypairStore: Failed to parse stored data', error);
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
              Logger.error('KeypairStore: Failed to store data', error);
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
          Logger.info('KeypairStore: Starting rehydration from storage');

          return (state, error) => {
            if (error) {
              Logger.warn('KeypairStore: Failed to rehydrate from storage', error);
              // Use setTimeout to avoid circular reference
              setTimeout(() => {
                useKeypairStore.getState().setHydrated(true);
              }, 0);
            } else if (state) {
              // Validate that secretKey is a proper Uint8Array
              const isValidSecretKey = state.secretKey instanceof Uint8Array && state.secretKey.length === 32;

              Logger.info('KeypairStore: Successfully rehydrated from storage', {
                hasKeys: !!(state?.publicKey && state?.secretKey),
                hasGenerated: state?.hasGenerated,
                hasSession: !!state?.session,
                isAuthenticated: state?.isAuthenticated,
                secretKeyType: state?.secretKey?.constructor?.name,
                secretKeyLength: state?.secretKey?.length,
                isValidSecretKey,
              });

              // Use setTimeout to avoid circular reference
              setTimeout(() => {
                useKeypairStore.getState().setHydrated(true);
              }, 0);
            } else {
              // No stored state, ensure clean initial state and mark as hydrated
              Logger.warn('KeypairStore: No stored state found, ensuring clean initial state');
              const cleanState = {
                ...initialState,
                hasHydrated: true,
              };
              Logger.info('KeypairStore: Setting clean state', cleanState);

              // Use setTimeout to avoid circular reference
              setTimeout(() => {
                useKeypairStore.setState(cleanState);
              }, 0);
            }
          };
        },
      },
    ),
    {
      name: 'Keypair Store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);
