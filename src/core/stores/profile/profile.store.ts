import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { SignupResult } from '@/core';

// State interface
export interface ProfileState {
  // User authentication data
  currentUserPubky: string | null;
  session: SignupResult['session'] | null;
  isAuthenticated: boolean;
}

// Actions interface
export interface ProfileActions {
  // Authentication data management
  setCurrentUserPubky: (pubky: string | null) => void;
  setSession: (session: SignupResult['session'] | null) => void;
  clearSession: () => void;
  setAuthenticated: (isAuthenticated: boolean) => void;

  // Storage management
  reset: () => void;
}

export type ProfileStore = ProfileState & ProfileActions;

// Default state
const defaultState: ProfileState = {
  currentUserPubky: null,
  session: null,
  isAuthenticated: false,
};

// Create the store
export const useProfileStore = create<ProfileStore>()(
  devtools(
    persist(
      (set) => ({
        ...defaultState,

        // Authentication data management
        setCurrentUserPubky: (pubky: string | null) => {
          set(
            {
              currentUserPubky: pubky,
            },
            false,
            'setCurrentUserPubky',
          );
        },

        setSession: (session: SignupResult['session'] | null) => {
          set(
            {
              session,
            },
            false,
            'setSession',
          );
        },

        clearSession: () => {
          set(
            {
              session: null,
              isAuthenticated: false,
              currentUserPubky: null,
            },
            false,
            'clearSession',
          );
        },

        setAuthenticated: (isAuthenticated: boolean) => {
          set(
            {
              isAuthenticated,
            },
            false,
            'setAuthenticated',
          );
        },

        // Storage management
        reset: () => {
          set(defaultState, false, 'reset');
        },
      }),
      {
        name: 'profile-store',
        // Only persist essential data
        partialize: (state) => ({
          currentUserPubky: state.currentUserPubky,
          session: state.session,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    {
      name: 'profile-store',
    },
  ),
);

export const useCurrentUserPubky = () => useProfileStore((state) => state.currentUserPubky);
export const useIsAuthenticated = () => useProfileStore((state) => state.isAuthenticated);
