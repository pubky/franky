import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStatus } from './useAuthStatus';

// Mock the stores
const mockOnboardingStore = {
  hasHydrated: true,
  pubky: '',
  secretKey: '',
  reset: vi.fn(),
  setHydrated: vi.fn(),
};

const mockProfileStore = {
  isAuthenticated: false,
  reset: vi.fn(),
  setAuthenticated: vi.fn(),
};

vi.mock('@/core', () => ({
  useOnboardingStore: () => mockOnboardingStore,
  useProfileStore: () => mockProfileStore,
}));

describe('useAuthStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default mock values
    mockOnboardingStore.hasHydrated = true;
    mockOnboardingStore.pubky = '';
    mockOnboardingStore.secretKey = '';
    mockProfileStore.isAuthenticated = false;
  });

  it('should return loading state when not hydrated', () => {
    mockOnboardingStore.hasHydrated = false;

    const { result } = renderHook(() => useAuthStatus());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.status).toBe('UNAUTHENTICATED');
  });

  it('should return not loading when hydrated', () => {
    mockOnboardingStore.hasHydrated = true;

    const { result } = renderHook(() => useAuthStatus());

    expect(result.current.isLoading).toBe(false);
  });

  it('should return UNAUTHENTICATED status when not authenticated', () => {
    mockOnboardingStore.hasHydrated = true;
    mockProfileStore.isAuthenticated = false;

    const { result } = renderHook(() => useAuthStatus());

    expect(result.current.status).toBe('UNAUTHENTICATED');
    expect(result.current.isFullyAuthenticated).toBe(false);
  });

  it('should return AUTHENTICATED status when authenticated', () => {
    mockOnboardingStore.hasHydrated = true;
    mockProfileStore.isAuthenticated = true;

    const { result } = renderHook(() => useAuthStatus());

    expect(result.current.status).toBe('AUTHENTICATED');
    expect(result.current.isFullyAuthenticated).toBe(true);
  });

  it('should check keypair existence correctly', () => {
    mockOnboardingStore.hasHydrated = true;
    mockOnboardingStore.pubky = 'test-public-key';
    mockOnboardingStore.secretKey = 'test-secret-key';

    const { result } = renderHook(() => useAuthStatus());

    expect(result.current.hasKeypair).toBe(true);
  });

  it('should handle missing keypair correctly', () => {
    mockOnboardingStore.hasHydrated = true;
    mockOnboardingStore.pubky = '';
    mockOnboardingStore.secretKey = '';

    const { result } = renderHook(() => useAuthStatus());

    expect(result.current.hasKeypair).toBe(false);
  });

  describe('Logout Scenario - Hydration Preservation', () => {
    it('should remain not loading after store reset if hydration is preserved', () => {
      // Simulate authenticated state
      mockOnboardingStore.hasHydrated = true;
      mockOnboardingStore.pubky = 'test-public-key';
      mockOnboardingStore.secretKey = 'test-secret-key';
      mockProfileStore.isAuthenticated = true;

      const { result, rerender } = renderHook(() => useAuthStatus());

      // Initially authenticated and not loading
      expect(result.current.isLoading).toBe(false);
      expect(result.current.status).toBe('AUTHENTICATED');

      // Simulate logout: reset stores but preserve hydration
      mockOnboardingStore.pubky = '';
      mockOnboardingStore.secretKey = '';
      mockProfileStore.isAuthenticated = false;
      // hasHydrated should remain true (this is the fix)
      mockOnboardingStore.hasHydrated = true;

      rerender();

      // After logout: should not be loading and should be unauthenticated
      expect(result.current.isLoading).toBe(false);
      expect(result.current.status).toBe('UNAUTHENTICATED');
      expect(result.current.hasKeypair).toBe(false);
    });

    it('would be stuck loading if hydration was not preserved (demonstrating the bug)', () => {
      // Simulate the old buggy behavior
      mockOnboardingStore.hasHydrated = true;
      mockOnboardingStore.pubky = 'test-public-key';
      mockOnboardingStore.secretKey = 'test-secret-key';
      mockProfileStore.isAuthenticated = true;

      const { result, rerender } = renderHook(() => useAuthStatus());

      // Initially authenticated and not loading
      expect(result.current.isLoading).toBe(false);
      expect(result.current.status).toBe('AUTHENTICATED');

      // Simulate the old buggy logout: reset stores including hydration
      mockOnboardingStore.pubky = '';
      mockOnboardingStore.secretKey = '';
      mockProfileStore.isAuthenticated = false;
      mockOnboardingStore.hasHydrated = false; // This was the bug

      rerender();

      // With the bug: would be stuck loading forever
      expect(result.current.isLoading).toBe(true);
    });
  });
});
