import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUserProfile } from './useUserProfile';
import * as Core from '@/core';

// Hoist mock data using vi.hoisted
// Note: undefined = query not executed yet (loading), null = query executed but no data found
const { mockUserDetails, setMockUserDetails } = vi.hoisted(() => {
  const data = { current: undefined as Core.UserDetailsModelSchema | null | undefined };
  return {
    mockUserDetails: data,
    setMockUserDetails: (value: Core.UserDetailsModelSchema | null | undefined) => {
      data.current = value;
    },
  };
});

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((queryFn) => {
    // Execute the query function to return mock data
    if (queryFn) {
      void queryFn();
    }
    return mockUserDetails.current;
  }),
}));

// Mock Core controllers and services
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    ProfileController: {
      read: vi.fn().mockResolvedValue(undefined),
    },
    UserController: {
      getDetails: vi.fn().mockImplementation(() => Promise.resolve(mockUserDetails.current)),
    },
    FileController: {
      getAvatarUrl: vi.fn((userId: string) => `https://example.com/avatar/${userId}`),
    },
  };
});

// Mock Config to provide DEFAULT_URL
vi.mock('@/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/config')>();
  return {
    ...actual,
    DEFAULT_URL: 'https://example.com',
  };
});

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to undefined (simulating query not yet executed)
    setMockUserDetails(undefined);
  });

  describe('Profile data fetching', () => {
    it('returns null profile and isLoading true when query has not executed yet (undefined)', () => {
      // undefined = query not executed yet
      setMockUserDetails(undefined);
      const { result } = renderHook(() => useUserProfile('test-user-id'));

      expect(result.current.profile).toBeNull();
      expect(result.current.isLoading).toBe(true);
    });

    it('returns null profile and isLoading false when user not found (null)', () => {
      // null = query executed but user not found
      setMockUserDetails(null);
      const { result } = renderHook(() => useUserProfile('test-user-id'));

      expect(result.current.profile).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('returns profile data when user exists', () => {
      setMockUserDetails({
        id: 'test-user-id',
        name: 'Test User',
        bio: 'Test bio',
        image: 'avatar.jpg',
        status: 'Active',
        links: [],
        indexed_at: Date.now(),
      } as Core.UserDetailsModelSchema);

      const { result } = renderHook(() => useUserProfile('test-user-id'));

      expect(result.current.profile).not.toBeNull();
      expect(result.current.profile?.name).toBe('Test User');
      expect(result.current.profile?.bio).toBe('Test bio');
      expect(result.current.profile?.status).toBe('Active');
      expect(result.current.isLoading).toBe(false);
    });

    it('handles missing optional fields gracefully', () => {
      setMockUserDetails({
        id: 'test-user-id',
        name: 'Test User',
        // Missing bio, image, status
        links: [],
        indexed_at: Date.now(),
      } as Core.UserDetailsModelSchema);

      const { result } = renderHook(() => useUserProfile('test-user-id'));

      expect(result.current.profile?.name).toBe('Test User');
      expect(result.current.profile?.bio).toBe('');
      expect(result.current.profile?.status).toBe('');
      expect(result.current.profile?.avatarUrl).toBeUndefined();
    });
  });

  describe('Public key formatting', () => {
    it('builds correct public key format', () => {
      setMockUserDetails({
        id: 'test-user-id',
        name: 'Test',
      } as Core.UserDetailsModelSchema);

      const { result } = renderHook(() => useUserProfile('test-user-id'));

      expect(result.current.profile?.publicKey).toBe('pk:test-user-id');
    });

    it('handles empty userId', () => {
      const { result } = renderHook(() => useUserProfile(''));

      expect(result.current.profile).toBeNull();
    });
  });

  describe('Profile link generation', () => {
    it('builds correct profile link using config', () => {
      setMockUserDetails({
        id: 'test-user-id',
        name: 'Test',
      } as Core.UserDetailsModelSchema);

      const { result } = renderHook(() => useUserProfile('test-user-id'));

      // Uses DEFAULT_URL from config (SSR-safe)
      expect(result.current.profile?.link).toBe('https://example.com/profile/test-user-id');
    });
  });

  describe('Avatar URL generation', () => {
    it('builds avatar URL when user has image', () => {
      setMockUserDetails({
        id: 'test-user-id',
        name: 'Test',
        image: 'avatar.jpg',
      } as Core.UserDetailsModelSchema);

      const { result } = renderHook(() => useUserProfile('test-user-id'));

      expect(result.current.profile?.avatarUrl).toBe('https://example.com/avatar/test-user-id');
      expect(Core.FileController.getAvatarUrl).toHaveBeenCalledWith('test-user-id');
    });

    it('returns undefined avatar URL when user has no image', () => {
      setMockUserDetails({
        id: 'test-user-id',
        name: 'Test',
        image: '',
      } as Core.UserDetailsModelSchema);

      const { result } = renderHook(() => useUserProfile('test-user-id'));

      expect(result.current.profile?.avatarUrl).toBeUndefined();
    });

    it('returns undefined avatar URL when image is null', () => {
      setMockUserDetails({
        id: 'test-user-id',
        name: 'Test',
        image: null,
      } as Core.UserDetailsModelSchema);

      const { result } = renderHook(() => useUserProfile('test-user-id'));

      expect(result.current.profile?.avatarUrl).toBeUndefined();
    });
  });

  describe('Default values', () => {
    it('includes default emoji', () => {
      setMockUserDetails({
        id: 'test-user-id',
        name: 'Test',
      } as Core.UserDetailsModelSchema);

      const { result } = renderHook(() => useUserProfile('test-user-id'));

      expect(result.current.profile?.emoji).toBe('🌴');
    });
  });

  describe('Loading state', () => {
    it('isLoading is true when query has not executed yet (undefined)', () => {
      setMockUserDetails(undefined);
      const { result } = renderHook(() => useUserProfile('test-user-id'));

      expect(result.current.isLoading).toBe(true);
    });

    it('isLoading is false when user not found (null)', () => {
      setMockUserDetails(null);
      const { result } = renderHook(() => useUserProfile('test-user-id'));

      expect(result.current.isLoading).toBe(false);
    });

    it('isLoading is false when user details are available', () => {
      setMockUserDetails({
        id: 'test-user-id',
        name: 'Test',
      } as Core.UserDetailsModelSchema);

      const { result } = renderHook(() => useUserProfile('test-user-id'));

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Controller integration', () => {
    it('triggers UserController.getDetails to fetch from Nexus', () => {
      setMockUserDetails({
        id: 'test-user-id',
        name: 'Test',
      } as Core.UserDetailsModelSchema);

      renderHook(() => useUserProfile('test-user-id'));

      // UserController.getDetails should be called in the background
      expect(Core.UserController.getDetails).toHaveBeenCalledWith({ userId: 'test-user-id' });
    });
  });
});
