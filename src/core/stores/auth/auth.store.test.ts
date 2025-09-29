import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { SignupResult } from '@/core';
import { useAuthStore } from './auth.store';

// Mock the logger
vi.mock('@/libs/logger', () => ({
  Logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset the real store to initial state before each test
    useAuthStore.getState().reset();
    vi.clearAllMocks();
  });

  describe('Authentication Management', () => {
    it('should set currentUserPubky without automatically updating authentication state', () => {
      const pubky = 'test-pubky-key';
      const store = useAuthStore.getState();

      // Set pubky - should not automatically set authenticated
      store.setCurrentUserPubky(pubky);
      expect(useAuthStore.getState().currentUserPubky).toBe(pubky);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      // Add session - should still not automatically set authenticated
      const mockSession = {} as SignupResult['session'];
      store.setSession(mockSession);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      // Only when explicitly set should it be authenticated
      store.setAuthenticated(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should set session without automatically updating authentication state', () => {
      const mockSession = {} as SignupResult['session'];
      const store = useAuthStore.getState();

      // Set session - should not automatically set authenticated
      store.setSession(mockSession);
      expect(useAuthStore.getState().session).toBe(mockSession);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      // Add pubky - should still not automatically set authenticated
      store.setCurrentUserPubky('test-pubky');
      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      // Only when explicitly set should it be authenticated
      store.setAuthenticated(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should clear session and authentication state manually', () => {
      const store = useAuthStore.getState();
      const mockSession = {} as SignupResult['session'];

      // Set up authenticated state
      store.setCurrentUserPubky('test-pubky');
      store.setSession(mockSession);
      store.setAuthenticated(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Clear session and authentication manually (not using reset which clears everything)
      store.setSession(null);
      store.setAuthenticated(false);
      expect(useAuthStore.getState().session).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().currentUserPubky).toBe('test-pubky'); // Should remain
    });

    it('should manually set authentication state', () => {
      const store = useAuthStore.getState();

      store.setAuthenticated(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      store.setAuthenticated(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('Store Reset', () => {
    it('should reset store to default state', () => {
      const store = useAuthStore.getState();
      const mockSession = {} as SignupResult['session'];

      // Set some state
      store.setCurrentUserPubky('test-pubky');
      store.setSession(mockSession);
      store.setAuthenticated(true);

      // Verify state is set
      expect(useAuthStore.getState().currentUserPubky).toBe('test-pubky');
      expect(useAuthStore.getState().session).toBe(mockSession);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Reset store
      store.reset();

      // Verify state is reset
      expect(useAuthStore.getState().currentUserPubky).toBeNull();
      expect(useAuthStore.getState().session).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('Selectors', () => {
    it('should return current user pubky when available', () => {
      const store = useAuthStore.getState();
      const testPubky = 'test-pubky-123';

      // Set pubky
      store.setCurrentUserPubky(testPubky);

      // Use selector to get pubky
      const selectedPubky = store.selectCurrentUserPubky();
      expect(selectedPubky).toBe(testPubky);
    });

    it('should throw error when trying to select pubky when not available', () => {
      const store = useAuthStore.getState();

      // Ensure pubky is null
      store.setCurrentUserPubky(null);

      // Selector should throw error
      expect(() => store.selectCurrentUserPubky()).toThrow(
        'Current user pubky is not available. User may not be authenticated.',
      );
    });

    it('should throw error when trying to select pubky from initial state', () => {
      const store = useAuthStore.getState();

      // Initial state should have null pubky
      expect(useAuthStore.getState().currentUserPubky).toBeNull();

      // Selector should throw error
      expect(() => store.selectCurrentUserPubky()).toThrow(
        'Current user pubky is not available. User may not be authenticated.',
      );
    });

    it('should still throw error even when authenticated but pubky is null', () => {
      const store = useAuthStore.getState();
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
