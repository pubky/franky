import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProfileHeader } from './useProfileHeader';
import * as Core from '@/core';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useCopyToClipboard hook
const mockCopyToClipboard = vi.fn();
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useCopyToClipboard: () => ({
      copyToClipboard: mockCopyToClipboard,
    }),
  };
});

// Mock user data
let mockUserDetails: Core.UserDetailsModelSchema | null = null;
let mockUserCounts: Core.UserCountsModelSchema | null = null;

// Mock dexie-react-hooks - return mockUserDetails for first query, mockUserCounts for second
let queryCallCount = 0;
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(() => {
    queryCallCount++;
    // First call returns userDetails, second call returns userCounts
    return queryCallCount % 2 === 1 ? mockUserDetails : mockUserCounts;
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
      getDetails: vi.fn(),
      getCounts: vi.fn(),
    },
    filesApi: {
      getAvatar: vi.fn((userId: string) => `https://example.com/avatar/${userId}`),
    },
  };
});

describe('useProfileHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserDetails = null;
    mockUserCounts = null;
    queryCallCount = 0;

    // Reset window.location
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://example.com' },
      writable: true,
    });
  });

  describe('Profile data', () => {
    it('returns profile data when user exists', () => {
      mockUserDetails = {
        id: 'test-user-id',
        name: 'Test User',
        bio: 'Test bio',
        image: 'avatar.jpg',
        status: 'Active',
        links: [],
        indexed_at: Date.now(),
      } as Core.UserDetailsModelSchema;

      mockUserCounts = {
        id: 'test-user-id',
        posts: 10,
        replies: 5,
        followers: 20,
        following: 15,
        friends: 8,
        tagged: 3,
        tags: 0,
        unique_tags: 0,
        bookmarks: 0,
      } as Core.UserCountsModelSchema;

      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      expect(result.current.profile.name).toBe('Test User');
      expect(result.current.profile.bio).toBe('Test bio');
      expect(result.current.profile.status).toBe('Active');
    });

    it('returns default values when user details are null', () => {
      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      expect(result.current.profile.name).toBe('');
      expect(result.current.profile.bio).toBe('');
      expect(result.current.profile.status).toBe('');
    });

    it('builds correct public key format', () => {
      mockUserDetails = {
        id: 'test-user-id',
        name: 'Test',
      } as Core.UserDetailsModelSchema;

      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      expect(result.current.profile.publicKey).toBe('pk:test-user-id');
    });

    it('builds correct profile link', () => {
      mockUserDetails = {
        id: 'test-user-id',
        name: 'Test',
      } as Core.UserDetailsModelSchema;

      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      expect(result.current.profile.link).toBe('https://example.com/profile/test-user-id');
    });

    it('builds avatar URL when user has image', () => {
      mockUserDetails = {
        id: 'test-user-id',
        name: 'Test',
        image: 'avatar.jpg',
      } as Core.UserDetailsModelSchema;

      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      expect(result.current.profile.avatarUrl).toBe('https://example.com/avatar/test-user-id');
      expect(Core.filesApi.getAvatar).toHaveBeenCalledWith('test-user-id');
    });

    it('returns undefined avatar URL when user has no image', () => {
      mockUserDetails = {
        id: 'test-user-id',
        name: 'Test',
        image: '',
      } as Core.UserDetailsModelSchema;

      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      expect(result.current.profile.avatarUrl).toBeUndefined();
    });
  });

  describe('Stats', () => {
    it('returns correct stats when user counts exist', () => {
      mockUserDetails = {
        id: 'test-user-id',
        name: 'Test',
      } as Core.UserDetailsModelSchema;

      mockUserCounts = {
        id: 'test-user-id',
        posts: 10,
        replies: 5,
        followers: 20,
        following: 15,
        friends: 8,
        tagged: 3,
        tags: 0,
        unique_tags: 0,
        bookmarks: 0,
      } as Core.UserCountsModelSchema;

      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      expect(result.current.stats.posts).toBe(10);
      expect(result.current.stats.replies).toBe(5);
      expect(result.current.stats.followers).toBe(20);
      expect(result.current.stats.following).toBe(15);
      expect(result.current.stats.friends).toBe(8);
      expect(result.current.stats.tagged).toBe(3);
    });

    it('returns zero stats when user counts are null', () => {
      mockUserDetails = {
        id: 'test-user-id',
        name: 'Test',
      } as Core.UserDetailsModelSchema;

      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      expect(result.current.stats.posts).toBe(0);
      expect(result.current.stats.replies).toBe(0);
      expect(result.current.stats.followers).toBe(0);
      expect(result.current.stats.following).toBe(0);
      expect(result.current.stats.friends).toBe(0);
      expect(result.current.stats.tagged).toBe(0);
    });

    it('notifications stat is always 0 (not implemented yet)', () => {
      mockUserDetails = {
        id: 'test-user-id',
        name: 'Test',
      } as Core.UserDetailsModelSchema;

      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      expect(result.current.stats.notifications).toBe(0);
    });
  });

  describe('Actions', () => {
    it('onCopyPublicKey calls copyToClipboard with public key', () => {
      mockUserDetails = {
        id: 'test-user-id',
        name: 'Test',
      } as Core.UserDetailsModelSchema;

      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      result.current.actions.onCopyPublicKey();
      expect(mockCopyToClipboard).toHaveBeenCalledWith('pk:test-user-id');
    });

    it('onCopyLink calls copyToClipboard with profile link', () => {
      mockUserDetails = {
        id: 'test-user-id',
        name: 'Test',
      } as Core.UserDetailsModelSchema;

      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      result.current.actions.onCopyLink();
      expect(mockCopyToClipboard).toHaveBeenCalledWith('https://example.com/profile/test-user-id');
    });

    it('onSignOut navigates to logout route', () => {
      mockUserDetails = {
        id: 'test-user-id',
        name: 'Test',
      } as Core.UserDetailsModelSchema;

      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      result.current.actions.onSignOut();
      expect(mockPush).toHaveBeenCalledWith('/logout');
    });

    it('onEdit logs to console (not implemented yet)', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockUserDetails = {
        id: 'test-user-id',
        name: 'Test',
      } as Core.UserDetailsModelSchema;

      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      result.current.actions.onEdit();
      expect(consoleSpy).toHaveBeenCalledWith('Edit clicked');

      consoleSpy.mockRestore();
    });

    it('onStatusClick logs to console (not implemented yet)', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockUserDetails = {
        id: 'test-user-id',
        name: 'Test',
      } as Core.UserDetailsModelSchema;

      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      result.current.actions.onStatusClick();
      expect(consoleSpy).toHaveBeenCalledWith('Status clicked');

      consoleSpy.mockRestore();
    });
  });

  describe('Loading state', () => {
    it('isLoading is true when user details are not available', () => {
      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      expect(result.current.isLoading).toBe(true);
    });

    it('isLoading is false when user details are available', () => {
      mockUserDetails = {
        id: 'test-user-id',
        name: 'Test',
      } as Core.UserDetailsModelSchema;

      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('handles empty userId gracefully', () => {
      const { result } = renderHook(() => useProfileHeader(''));

      expect(result.current.profile.publicKey).toBe('');
      expect(result.current.profile.link).toBe('');
      expect(result.current.isLoading).toBe(true);
    });

    it('handles partial user details', () => {
      mockUserDetails = {
        id: 'test-user-id',
        name: 'Test',
        // Missing bio, image, status
      } as Core.UserDetailsModelSchema;

      const { result } = renderHook(() => useProfileHeader('test-user-id'));

      expect(result.current.profile.name).toBe('Test');
      expect(result.current.profile.bio).toBe('');
      expect(result.current.profile.status).toBe('');
      expect(result.current.profile.avatarUrl).toBeUndefined();
    });
  });
});
