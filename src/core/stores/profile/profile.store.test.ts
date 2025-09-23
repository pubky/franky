import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { SignupResult } from '@/core';
import { useProfileStore } from './profile.store';

// Mock the logger
vi.mock('@/libs/logger', () => ({
  Logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ProfileStore', () => {
  beforeEach(() => {
    // Reset the real store to initial state before each test
    useProfileStore.getState().reset();
    vi.clearAllMocks();
  });

  describe('Authentication Management', () => {
    it('should set currentUserPubky without automatically updating authentication state', () => {
      const pubky = 'test-pubky-key';
      const store = useProfileStore.getState();

      // Set pubky - should not automatically set authenticated
      store.setCurrentUserPubky(pubky);
      expect(useProfileStore.getState().currentUserPubky).toBe(pubky);
      expect(useProfileStore.getState().isAuthenticated).toBe(false);

      // Add session - should still not automatically set authenticated
      const mockSession = {} as SignupResult['session'];
      store.setSession(mockSession);
      expect(useProfileStore.getState().isAuthenticated).toBe(false);

      // Only when explicitly set should it be authenticated
      store.setAuthenticated(true);
      expect(useProfileStore.getState().isAuthenticated).toBe(true);
    });

    it('should set session without automatically updating authentication state', () => {
      const mockSession = {} as SignupResult['session'];
      const store = useProfileStore.getState();

      // Set session - should not automatically set authenticated
      store.setSession(mockSession);
      expect(useProfileStore.getState().session).toBe(mockSession);
      expect(useProfileStore.getState().isAuthenticated).toBe(false);

      // Add pubky - should still not automatically set authenticated
      store.setCurrentUserPubky('test-pubky');
      expect(useProfileStore.getState().isAuthenticated).toBe(false);

      // Only when explicitly set should it be authenticated
      store.setAuthenticated(true);
      expect(useProfileStore.getState().isAuthenticated).toBe(true);
    });

    it('should clear session and authentication state manually', () => {
      const store = useProfileStore.getState();
      const mockSession = {} as SignupResult['session'];

      // Set up authenticated state
      store.setCurrentUserPubky('test-pubky');
      store.setSession(mockSession);
      store.setAuthenticated(true);
      expect(useProfileStore.getState().isAuthenticated).toBe(true);

      // Clear session and authentication manually (not using reset which clears everything)
      store.setSession(null);
      store.setAuthenticated(false);
      expect(useProfileStore.getState().session).toBeNull();
      expect(useProfileStore.getState().isAuthenticated).toBe(false);
      expect(useProfileStore.getState().currentUserPubky).toBe('test-pubky'); // Should remain
    });

    it('should manually set authentication state', () => {
      const store = useProfileStore.getState();

      store.setAuthenticated(true);
      expect(useProfileStore.getState().isAuthenticated).toBe(true);

      store.setAuthenticated(false);
      expect(useProfileStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('Store Reset', () => {
    it('should reset store to default state', () => {
      const store = useProfileStore.getState();
      const mockSession = {} as SignupResult['session'];

      // Set some state
      store.setCurrentUserPubky('test-pubky');
      store.setSession(mockSession);
      store.setAuthenticated(true);

      // Verify state is set
      expect(useProfileStore.getState().currentUserPubky).toBe('test-pubky');
      expect(useProfileStore.getState().session).toBe(mockSession);
      expect(useProfileStore.getState().isAuthenticated).toBe(true);

      // Reset store
      store.reset();

      // Verify state is reset
      expect(useProfileStore.getState().currentUserPubky).toBeNull();
      expect(useProfileStore.getState().session).toBeNull();
      expect(useProfileStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('Selectors', () => {
    it('should return current user pubky when available', () => {
      const store = useProfileStore.getState();
      const testPubky = 'test-pubky-123';

      // Set pubky
      store.setCurrentUserPubky(testPubky);

      // Use selector to get pubky
      const selectedPubky = store.selectCurrentUserPubky();
      expect(selectedPubky).toBe(testPubky);
    });

    it('should throw error when trying to select pubky when not available', () => {
      const store = useProfileStore.getState();

      // Ensure pubky is null
      store.setCurrentUserPubky(null);

      // Selector should throw error
      expect(() => store.selectCurrentUserPubky()).toThrow(
        'Current user pubky is not available. User may not be authenticated.',
      );
    });

    it('should throw error when trying to select pubky from initial state', () => {
      const store = useProfileStore.getState();

      // Initial state should have null pubky
      expect(useProfileStore.getState().currentUserPubky).toBeNull();

      // Selector should throw error
      expect(() => store.selectCurrentUserPubky()).toThrow(
        'Current user pubky is not available. User may not be authenticated.',
      );
    });

    it('should still throw error even when authenticated but pubky is null', () => {
      const store = useProfileStore.getState();
      const mockSession = {} as SignupResult['session'];

      // Set authenticated but no pubky (edge case)
      store.setSession(mockSession);
      store.setAuthenticated(true);
      store.setCurrentUserPubky(null);

      // Selector should still throw error
      expect(() => store.selectCurrentUserPubky()).toThrow(
        'Current user pubky is not available. User may not be authenticated.',
      );
    });
  });
});
