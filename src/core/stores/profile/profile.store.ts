import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { ProfileStore, profileInitialState } from './profile.types';
import { createProfileActions } from './profile.actions';
import { createProfileSelectors } from './profile.selectors';

// Store creation
export const useProfileStore = create<ProfileStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...profileInitialState,
        ...createProfileActions(set),
        ...createProfileSelectors(get),
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
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);
