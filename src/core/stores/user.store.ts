/**
 * User Store
 *
 * Global state management for the current user profile using Zustand.
 * Handles current user profile and profile operations.
 *
 * Features:
 * - Current user profile management
 * - Profile creation and updates
 * - Persistent storage (profile survives page refreshes)
 * - Loading states for better UX
 * - Error handling for profile operations
 * - Comprehensive logging for debugging and monitoring
 * - Storage rehydration tracking
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { NexusUser, NexusUserDetails, NexusUserLink } from '@/core';
import { Logger } from '@/libs/logger';

// Profile creation data (used during onboarding)
export interface ProfileCreationData {
  name: string;
  bio?: string;
  image?: string;
  links?: NexusUserLink[];
}

// Loading states for different operations
export interface UserLoadingStates {
  creatingProfile: boolean;
  updatingProfile: boolean;
  savingToHomeserver: boolean;
}

// Error states for different operations
export interface UserErrorStates {
  profileCreation: string | null;
  profileUpdate: string | null;
  homeserverSync: string | null;
}

// State interface
export interface UserState {
  // Current user profile
  currentUser: NexusUser | null;
  currentUserPubky: string | null;

  // Loading states
  loading: UserLoadingStates;

  // Error states
  errors: UserErrorStates;

  // Storage rehydration tracking
  isRehydrated: boolean;
}

// Actions interface
export interface UserActions {
  // Current user actions
  setCurrentUser: (user: NexusUser, pubky: string) => void;
  updateCurrentUser: (updates: Partial<NexusUserDetails>) => void;
  clearCurrentUser: () => void;

  // Profile creation (onboarding)
  createProfile: (profileData: ProfileCreationData, pubky: string) => Promise<NexusUser>;

  // Loading state management
  setLoading: (operation: keyof UserLoadingStates, loading: boolean) => void;
  clearAllLoading: () => void;

  // Error state management
  setError: (operation: keyof UserErrorStates, error: string | null) => void;
  clearAllErrors: () => void;

  // Storage management
  setRehydrated: (rehydrated: boolean) => void;
  reset: () => void;
}

// Combined store type
export type UserStore = UserState & UserActions;

// Default state
const defaultState: UserState = {
  currentUser: null,
  currentUserPubky: null,
  loading: {
    creatingProfile: false,
    updatingProfile: false,
    savingToHomeserver: false,
  },
  errors: {
    profileCreation: null,
    profileUpdate: null,
    homeserverSync: null,
  },
  isRehydrated: false,
};

// Create the store
export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultState,

        // Current user actions
        setCurrentUser: (user: NexusUser, pubky: string) => {
          Logger.info('Setting current user', { userId: user.details.id, pubky });
          set(
            {
              currentUser: user,
              currentUserPubky: pubky,
            },
            false,
            'setCurrentUser',
          );
        },

        updateCurrentUser: (updates: Partial<NexusUserDetails>) => {
          const state = get();
          if (!state.currentUser) {
            Logger.warn('Attempted to update current user when none exists');
            return;
          }

          Logger.info('Updating current user', {
            userId: state.currentUser.details.id,
            updates: Object.keys(updates),
          });

          const updatedUser: NexusUser = {
            ...state.currentUser,
            details: {
              ...state.currentUser.details,
              ...updates,
            },
          };

          set(
            {
              currentUser: updatedUser,
            },
            false,
            'updateCurrentUser',
          );
        },

        clearCurrentUser: () => {
          Logger.info('Clearing current user');
          set(
            {
              currentUser: null,
              currentUserPubky: null,
            },
            false,
            'clearCurrentUser',
          );
        },

        // Profile creation (onboarding)
        createProfile: async (profileData: ProfileCreationData, pubky: string): Promise<NexusUser> => {
          const { setLoading, setError } = get();

          try {
            setLoading('creatingProfile', true);
            setError('profileCreation', null);

            Logger.info('Creating new profile', {
              name: profileData.name,
              hasLinks: !!profileData.links?.length,
              pubky,
            });

            // Create a basic NexusUser structure
            const newUser: NexusUser = {
              details: {
                id: pubky,
                name: profileData.name,
                bio: profileData.bio || '',
                image: profileData.image || null,
                links: profileData.links || null,
                status: null,
                indexed_at: Date.now(),
              },
              counts: {
                tagged: 0,
                tags: 0,
                unique_tags: 0,
                posts: 0,
                replies: 0,
                following: 0,
                followers: 0,
                friends: 0,
                bookmarks: 0,
              },
              tags: [],
              relationship: {
                following: false,
                followed_by: false,
                muted: false,
              },
            };

            // Set as current user
            get().setCurrentUser(newUser, pubky);

            Logger.info('Profile created successfully', { userId: newUser.details.id });
            return newUser;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            Logger.error('Failed to create profile', { error: errorMessage, profileData });
            setError('profileCreation', errorMessage);
            throw error;
          } finally {
            setLoading('creatingProfile', false);
          }
        },

        // Loading state management
        setLoading: (operation: keyof UserLoadingStates, loading: boolean) => {
          Logger.debug('Setting loading state', { operation, loading });
          set(
            (state) => ({
              loading: {
                ...state.loading,
                [operation]: loading,
              },
            }),
            false,
            'setLoading',
          );
        },

        clearAllLoading: () => {
          Logger.debug('Clearing all loading states');
          set(
            {
              loading: {
                creatingProfile: false,
                updatingProfile: false,
                savingToHomeserver: false,
              },
            },
            false,
            'clearAllLoading',
          );
        },

        // Error state management
        setError: (operation: keyof UserErrorStates, error: string | null) => {
          Logger.debug('Setting error state', { operation, error });
          set(
            (state) => ({
              errors: {
                ...state.errors,
                [operation]: error,
              },
            }),
            false,
            'setError',
          );
        },

        clearAllErrors: () => {
          Logger.debug('Clearing all error states');
          set(
            {
              errors: {
                profileCreation: null,
                profileUpdate: null,
                homeserverSync: null,
              },
            },
            false,
            'clearAllErrors',
          );
        },

        // Storage management
        setRehydrated: (rehydrated: boolean) => {
          Logger.debug('Setting rehydration state', { rehydrated });
          set({ isRehydrated: rehydrated }, false, 'setRehydrated');
        },

        reset: () => {
          Logger.info('Resetting user store');
          set(defaultState, false, 'reset');
        },
      }),
      {
        name: 'user-store',
        // Only persist essential data
        partialize: (state) => ({
          currentUser: state.currentUser,
          currentUserPubky: state.currentUserPubky,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.setRehydrated(true);
            Logger.info('User store rehydrated', {
              currentUser: !!state.currentUser,
            });
          }
        },
      },
    ),
    {
      name: 'user-store',
    },
  ),
);

// Selector hooks for better performance
export const useCurrentUser = () => useUserStore((state) => state.currentUser);
export const useCurrentUserPubky = () => useUserStore((state) => state.currentUserPubky);
export const useUserLoading = () => useUserStore((state) => state.loading);
export const useUserErrors = () => useUserStore((state) => state.errors);

// Helper hooks
export const useCurrentUserName = () => useUserStore((state) => state.currentUser?.details.name || '');

export const useCurrentUserBio = () => useUserStore((state) => state.currentUser?.details.bio || '');

export const useCurrentUserImage = () => useUserStore((state) => state.currentUser?.details.image || null);

export const useCurrentUserLinks = () => useUserStore((state) => state.currentUser?.details.links || []);

// Check if user is authenticated
export const useIsAuthenticated = () => useUserStore((state) => !!state.currentUser);
