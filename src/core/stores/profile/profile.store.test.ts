import { describe, it, expect, beforeEach, vi } from 'vitest';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SignupResult } from '@/core';
import { Logger } from '@/libs/logger';

// Mock the logger
vi.mock('@/libs/logger', () => ({
  Logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Simplified test interfaces matching the actual store
export interface ProfileState {
  currentUserPubky: string | null;
  session: SignupResult['session'] | null;
  isAuthenticated: boolean;
}

export interface ProfileActions {
  setCurrentUserPubky: (pubky: string | null) => void;
  setSession: (session: SignupResult['session'] | null) => void;
  clearSession: () => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  reset: () => void;
}

export type ProfileStore = ProfileState & ProfileActions;

// Default state
const defaultState: ProfileState = {
  currentUserPubky: null,
  session: null,
  isAuthenticated: false,
};

// Create a test store without persistence
const createTestStore = () =>
  create<ProfileStore>()(
    devtools(
      (set, get) => ({
        ...defaultState,

        setCurrentUserPubky: (pubky: string | null) => {
          Logger.info('Setting current user pubky', { pubky: pubky ? '***' : 'null' });
          set(
            {
              currentUserPubky: pubky,
              // Don't automatically set isAuthenticated - let it be set explicitly
            },
            false,
            'setCurrentUserPubky',
          );
        },

        setSession: (session: SignupResult['session'] | null) => {
          Logger.info('Setting session', { hasSession: !!session });
          set(
            {
              session,
              // Don't automatically set isAuthenticated - let it be set explicitly
            },
            false,
            'setSession',
          );
        },

        clearSession: () => {
          Logger.info('Clearing session');
          set(
            {
              session: null,
              isAuthenticated: false,
            },
            false,
            'clearSession',
          );
        },

        setAuthenticated: (isAuthenticated: boolean) => {
          Logger.info('Setting authentication state', { isAuthenticated });
          set(
            {
              isAuthenticated,
            },
            false,
            'setAuthenticated',
          );
        },

        reset: () => {
          Logger.info('Resetting profile store');
          set(defaultState, false, 'reset');
        },
      }),
      {
        name: 'profile-store-test',
      },
    ),
  );

describe('ProfileStore', () => {
  let testStore: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    // Create a fresh store instance for each test
    testStore = createTestStore();
    vi.clearAllMocks();
  });

  describe('Authentication Management', () => {
    it('should set currentUserPubky without automatically updating authentication state', () => {
      const pubky = 'test-pubky-key';
      const store = testStore.getState();

      // Set pubky - should not automatically set authenticated
      store.setCurrentUserPubky(pubky);
      expect(testStore.getState().currentUserPubky).toBe(pubky);
      expect(testStore.getState().isAuthenticated).toBe(false);

      // Add session - should still not automatically set authenticated
      const mockSession = {} as SignupResult['session'];
      store.setSession(mockSession);
      expect(testStore.getState().isAuthenticated).toBe(false);

      // Only when explicitly set should it be authenticated
      store.setAuthenticated(true);
      expect(testStore.getState().isAuthenticated).toBe(true);
    });

    it('should set session without automatically updating authentication state', () => {
      const mockSession = {} as SignupResult['session'];
      const store = testStore.getState();

      // Set session - should not automatically set authenticated
      store.setSession(mockSession);
      expect(testStore.getState().session).toBe(mockSession);
      expect(testStore.getState().isAuthenticated).toBe(false);

      // Add pubky - should still not automatically set authenticated
      store.setCurrentUserPubky('test-pubky');
      expect(testStore.getState().isAuthenticated).toBe(false);

      // Only when explicitly set should it be authenticated
      store.setAuthenticated(true);
      expect(testStore.getState().isAuthenticated).toBe(true);
    });

    it('should clear session and authentication state', () => {
      const store = testStore.getState();
      const mockSession = {} as SignupResult['session'];

      // Set up authenticated state
      store.setCurrentUserPubky('test-pubky');
      store.setSession(mockSession);
      store.setAuthenticated(true);
      expect(testStore.getState().isAuthenticated).toBe(true);

      // Clear session
      store.clearSession();
      expect(testStore.getState().session).toBeNull();
      expect(testStore.getState().isAuthenticated).toBe(false);
      expect(testStore.getState().currentUserPubky).toBe('test-pubky'); // Should remain
    });

    it('should manually set authentication state', () => {
      const store = testStore.getState();

      store.setAuthenticated(true);
      expect(testStore.getState().isAuthenticated).toBe(true);

      store.setAuthenticated(false);
      expect(testStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('Store Reset', () => {
    it('should reset store to default state', () => {
      const store = testStore.getState();
      const mockSession = {} as SignupResult['session'];

      // Set some state
      store.setCurrentUserPubky('test-pubky');
      store.setSession(mockSession);
      store.setAuthenticated(true);

      // Verify state is set
      expect(testStore.getState().currentUserPubky).toBe('test-pubky');
      expect(testStore.getState().session).toBe(mockSession);
      expect(testStore.getState().isAuthenticated).toBe(true);

      // Reset store
      store.reset();

      // Verify state is reset
      expect(testStore.getState().currentUserPubky).toBeNull();
      expect(testStore.getState().session).toBeNull();
      expect(testStore.getState().isAuthenticated).toBe(false);
    });
  });
});
