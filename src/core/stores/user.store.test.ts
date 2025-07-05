import { describe, it, expect, beforeEach, vi } from 'vitest';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { NexusUser, NexusUserDetails, NexusUserLink } from '@/core';
import { Logger } from '@/libs/logger';

// Mock Logger
vi.mock('@/libs/logger', () => ({
  Logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

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

// Create a test store without persistence
const createTestStore = () =>
  create<UserStore>()(
    devtools(
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
        name: 'user-store-test',
      },
    ),
  );

describe('UserStore', () => {
  let testStore: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    // Create a fresh store instance for each test
    testStore = createTestStore();
    vi.clearAllMocks();
  });

  describe('Profile Creation', () => {
    it('should create a profile successfully', async () => {
      const profileData: ProfileCreationData = {
        name: 'Test User',
        bio: 'Test bio',
        links: [
          { title: 'GitHub', url: 'https://github.com/testuser' },
          { title: 'Website', url: 'https://testuser.com' },
        ],
      };
      const pubky = 'test-pubky-key';

      const store = testStore.getState();
      const newUser = await store.createProfile(profileData, pubky);

      expect(newUser).toBeDefined();
      expect(newUser.details.id).toBe(pubky);
      expect(newUser.details.name).toBe(profileData.name);
      expect(newUser.details.bio).toBe(profileData.bio);
      expect(newUser.details.links).toEqual(profileData.links);

      // Check that current user is set
      const currentUser = testStore.getState().currentUser;
      expect(currentUser).toBe(newUser);
      expect(testStore.getState().currentUserPubky).toBe(pubky);
    });

    it('should handle profile creation with minimal data', async () => {
      const profileData: ProfileCreationData = {
        name: 'Minimal User',
      };
      const pubky = 'minimal-pubky-key';

      const store = testStore.getState();
      const newUser = await store.createProfile(profileData, pubky);

      expect(newUser.details.name).toBe(profileData.name);
      expect(newUser.details.bio).toBe('');
      expect(newUser.details.image).toBeNull();
      expect(newUser.details.links).toBeNull();
    });
  });

  describe('Current User Management', () => {
    it('should set and clear current user', () => {
      const mockUser = {
        details: {
          id: 'test-user-id',
          name: 'Test User',
          bio: 'Test bio',
          image: null,
          links: null,
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
      const pubky = 'test-pubky';

      const store = testStore.getState();

      // Set current user
      store.setCurrentUser(mockUser, pubky);
      expect(testStore.getState().currentUser).toBe(mockUser);
      expect(testStore.getState().currentUserPubky).toBe(pubky);

      // Clear current user
      store.clearCurrentUser();
      expect(testStore.getState().currentUser).toBeNull();
      expect(testStore.getState().currentUserPubky).toBeNull();
    });

    it('should update current user details', () => {
      const mockUser = {
        details: {
          id: 'test-user-id',
          name: 'Test User',
          bio: 'Test bio',
          image: null,
          links: null,
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
      const pubky = 'test-pubky';

      const store = testStore.getState();
      store.setCurrentUser(mockUser, pubky);

      // Update user details
      const updates = {
        name: 'Updated Name',
        bio: 'Updated bio',
      };
      store.updateCurrentUser(updates);

      expect(testStore.getState().currentUser?.details.name).toBe(updates.name);
      expect(testStore.getState().currentUser?.details.bio).toBe(updates.bio);
      expect(testStore.getState().currentUser?.details.id).toBe(mockUser.details.id); // Should remain unchanged
    });
  });

  describe('Loading and Error States', () => {
    it('should manage loading states', () => {
      const store = testStore.getState();

      expect(testStore.getState().loading.creatingProfile).toBe(false);

      store.setLoading('creatingProfile', true);
      expect(testStore.getState().loading.creatingProfile).toBe(true);

      store.setLoading('creatingProfile', false);
      expect(testStore.getState().loading.creatingProfile).toBe(false);

      // Set multiple loading states
      store.setLoading('updatingProfile', true);
      store.setLoading('savingToHomeserver', true);
      expect(testStore.getState().loading.updatingProfile).toBe(true);
      expect(testStore.getState().loading.savingToHomeserver).toBe(true);

      store.clearAllLoading();
      expect(testStore.getState().loading.updatingProfile).toBe(false);
      expect(testStore.getState().loading.savingToHomeserver).toBe(false);
    });

    it('should manage error states', () => {
      const store = testStore.getState();

      expect(testStore.getState().errors.profileCreation).toBeNull();

      store.setError('profileCreation', 'Test error');
      expect(testStore.getState().errors.profileCreation).toBe('Test error');

      store.setError('profileCreation', null);
      expect(testStore.getState().errors.profileCreation).toBeNull();

      // Set multiple error states
      store.setError('profileUpdate', 'Update error');
      store.setError('homeserverSync', 'Sync error');
      expect(testStore.getState().errors.profileUpdate).toBe('Update error');
      expect(testStore.getState().errors.homeserverSync).toBe('Sync error');

      store.clearAllErrors();
      expect(testStore.getState().errors.profileUpdate).toBeNull();
      expect(testStore.getState().errors.homeserverSync).toBeNull();
    });
  });

  describe('Store Reset', () => {
    it('should reset store to default state', async () => {
      const store = testStore.getState();

      // Set some state
      const profileData: ProfileCreationData = {
        name: 'Test User',
        bio: 'Test bio',
      };
      await store.createProfile(profileData, 'test-pubky');
      store.setLoading('updatingProfile', true);
      store.setError('profileCreation', 'Test error');

      // Verify state is set
      expect(testStore.getState().currentUser).not.toBeNull();
      expect(testStore.getState().loading.updatingProfile).toBe(true);
      expect(testStore.getState().errors.profileCreation).toBe('Test error');

      // Reset store
      store.reset();

      // Verify state is reset
      expect(testStore.getState().currentUser).toBeNull();
      expect(testStore.getState().currentUserPubky).toBeNull();
      expect(testStore.getState().loading.updatingProfile).toBe(false);
      expect(testStore.getState().errors.profileCreation).toBeNull();
      expect(testStore.getState().isRehydrated).toBe(false);
    });
  });
});
