/**
 * Keypair Store
 *
 * Global state management for cryptographic keypairs using Zustand.
 * Handles key generation, persistence, and loading states.
 *
 * Features:
 * - Automatic key generation prevention (no double generation)
 * - Persistent storage (keys survive page refreshes)
 * - Loading states for better UX
 * - Error handling for key generation failures
 * - Comprehensive logging for debugging and monitoring
 * - Storage rehydration tracking
 * - Proper Uint8Array serialization/deserialization
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { HomeserverService } from '@/core/services/homeserver';
import { Logger } from '@/libs/logger';

export interface KeypairState {
  publicKey: string;
  secretKey: Uint8Array;
  isGenerating: boolean;
  hasGenerated: boolean;
}

export interface KeypairActions {
  generateKeys: (force?: boolean) => void;
  clearKeys: () => void;
  setGenerating: (isGenerating: boolean) => void;
}

export type KeypairStore = KeypairState & KeypairActions;

const initialState: KeypairState = {
  publicKey: '',
  secretKey: new Uint8Array(),
  isGenerating: false,
  hasGenerated: false,
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
            const homeserverService = HomeserverService.getInstance();
            Logger.debug('KeypairStore: HomeserverService instance obtained');

            const keypair = homeserverService.generateRandomKeys();
            Logger.info('KeypairStore: Keys generated successfully', {
              publicKeyLength: keypair.publicKey.length,
              secretKeyLength: keypair.secretKey.length,
              secretKeyType: keypair.secretKey.constructor.name,
            });

            // Small delay to show the loading state
            setTimeout(() => {
              set({
                publicKey: keypair.publicKey,
                secretKey: keypair.secretKey,
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
          set(initialState);
          Logger.debug('KeypairStore: State reset to initial values');
        },

        setGenerating: (isGenerating: boolean) => {
          Logger.debug('KeypairStore: Setting generating state', { isGenerating });
          set({ isGenerating });
        },
      }),
      {
        name: 'keypair-storage',

        // Only persist the keys, not the loading states
        partialize: (state) => ({
          publicKey: state.publicKey,
          secretKey: state.secretKey,
          hasGenerated: state.hasGenerated,
        }),
        onRehydrateStorage: () => {
          Logger.info('KeypairStore: Starting rehydration from storage');
          return (state, error) => {
            if (error) {
              Logger.error('KeypairStore: Failed to rehydrate from storage', error);
            } else if (state) {
              // Validate that secretKey is a proper Uint8Array
              const isValidSecretKey = state.secretKey instanceof Uint8Array && state.secretKey.length === 32;

              if (!isValidSecretKey && state.secretKey) {
                Logger.warn('KeypairStore: Detected corrupted secretKey in storage, clearing storage', {
                  secretKeyType: state.secretKey?.constructor?.name,
                  secretKeyLength: state.secretKey?.length,
                  isUint8Array: state.secretKey instanceof Uint8Array,
                });

                // Clear corrupted storage
                try {
                  localStorage.removeItem('keypair-storage');
                  Logger.info('KeypairStore: Cleared corrupted storage');
                } catch (clearError) {
                  Logger.error('KeypairStore: Failed to clear corrupted storage', clearError);
                }

                // Reset state to initial values but don't trigger immediate regeneration
                useKeypairStore.setState({
                  ...initialState,
                  // Mark as not generated so the UI knows to regenerate
                  hasGenerated: false,
                });
                return;
              }

              Logger.info('KeypairStore: Successfully rehydrated from storage', {
                hasKeys: !!(state?.publicKey && state?.secretKey),
                hasGenerated: state?.hasGenerated,
                secretKeyType: state?.secretKey?.constructor?.name,
                secretKeyLength: state?.secretKey?.length,
                isValidSecretKey,
              });
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
