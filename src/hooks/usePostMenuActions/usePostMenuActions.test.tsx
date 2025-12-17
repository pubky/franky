import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePostMenuActions } from './usePostMenuActions';
import * as Core from '@/core';

// Hoist mock functions before vi.mock
const {
  mockCurrentUserPubky,
  setMockCurrentUserPubky,
  mockPostDetails,
  setMockPostDetails,
  mockUserDetails,
  setMockUserDetails,
  mockIsFollowing,
  setMockIsFollowing,
  mockToggleFollow,
  mockIsFollowUserLoading,
  mockIsMuted,
  setMockIsMuted,
  mockToggleMute,
  mockIsMuteUserLoading,
  mockCopyToClipboard,
  mockCommitDelete,
  mockToast,
  mockLoggerError,
  mockParseCompositeId,
} = vi.hoisted(() => {
  const currentUserPubky = { current: 'pk:current-user' as Core.Pubky | null };
  const postDetails = { current: null as unknown };
  const userDetails = { current: null as unknown };
  const isFollowing = { current: false };
  const toggleFollow = vi.fn();
  const isFollowUserLoading = vi.fn(() => false);
  const isMuted = { current: false };
  const toggleMute = vi.fn();
  const isMuteUserLoading = vi.fn(() => false);
  const copyToClipboard = vi.fn();
  const commitDelete = vi.fn();
  const toast = vi.fn();
  const loggerError = vi.fn();
  const parseCompositeId = vi.fn();

  return {
    mockCurrentUserPubky: currentUserPubky,
    setMockCurrentUserPubky: (value: Core.Pubky | null) => {
      currentUserPubky.current = value;
    },
    mockPostDetails: postDetails,
    setMockPostDetails: (value: unknown) => {
      postDetails.current = value;
    },
    mockUserDetails: userDetails,
    setMockUserDetails: (value: unknown) => {
      userDetails.current = value;
    },
    mockIsFollowing: isFollowing,
    setMockIsFollowing: (value: boolean) => {
      isFollowing.current = value;
    },
    mockToggleFollow: toggleFollow,
    mockIsFollowUserLoading: isFollowUserLoading,
    mockIsMuted: isMuted,
    setMockIsMuted: (value: boolean) => {
      isMuted.current = value;
    },
    mockToggleMute: toggleMute,
    mockIsMuteUserLoading: isMuteUserLoading,
    mockCopyToClipboard: copyToClipboard,
    mockCommitDelete: commitDelete,
    mockToast: toast,
    mockLoggerError: loggerError,
    mockParseCompositeId: parseCompositeId,
  };
});

// Mock Core
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    parseCompositeId: mockParseCompositeId,
    PostController: {
      commitDelete: mockCommitDelete,
    },
  };
});

// Mock App routes (needed by Header component which is imported via hooks)
vi.mock('@/app/routes', () => ({
  ROOT_ROUTES: '/',
  ONBOARDING_ROUTES: {
    BACKUP: '/onboarding/backup',
    HOMESERVER: '/onboarding/homeserver',
    INSTALL: '/onboarding/install',
    PROFILE: '/onboarding/profile',
    PUBKY: '/onboarding/pubky',
    SCAN: '/onboarding/scan',
  },
  AUTH_ROUTES: {
    SIGN_IN: '/sign-in',
    LOGOUT: '/logout',
  },
  APP_ROUTES: {
    HOME: '/home',
    SEARCH: '/search',
    HOT: '/hot',
    BOOKMARKS: '/bookmarks',
    SETTINGS: '/settings',
    PROFILE: '/profile',
  },
  PROFILE_ROUTES: {
    PROFILE: '/profile',
    NOTIFICATIONS: '/profile/notifications',
    POSTS: '/profile/posts',
    REPLIES: '/profile/replies',
    FOLLOWERS: '/profile/followers',
    FOLLOWING: '/profile/following',
    FRIENDS: '/profile/friends',
    UNIQUE_TAGS: '/profile/tagged',
    PROFILE_PAGE: '/profile/profile',
  },
  SETTINGS_ROUTES: {
    ACCOUNT: '/settings/account',
    EDIT: '/settings/edit',
    NOTIFICATIONS: '/settings/notifications',
    PRIVACY_SAFETY: '/settings/privacy-safety',
    MUTED_USERS: '/settings/muted-users',
    LANGUAGE: '/settings/language',
    HELP: '/settings/help',
  },
  POST_ROUTES: {
    POST: '/post',
  },
  PUBLIC_ROUTES: ['/logout'],
  ALLOWED_ROUTES: [
    '/onboarding/profile',
    '/home',
    '/search',
    '/hot',
    '/bookmarks',
    '/settings',
    '/profile',
    '/post',
    '/logout',
  ],
  UNAUTHENTICATED_ROUTES: {
    allowedRoutes: [
      '/',
      '/sign-in',
      '/onboarding/install',
      '/onboarding/scan',
      '/onboarding/pubky',
      '/onboarding/backup',
      '/onboarding/homeserver',
      '/logout',
    ],
    redirectTo: '/',
  },
  NEEDS_PROFILE_CREATION_ROUTES: {
    allowedRoutes: ['/onboarding/profile'],
    redirectTo: '/onboarding/profile',
  },
  AUTHENTICATED_ROUTES: {
    allowedRoutes: [
      '/onboarding/profile',
      '/home',
      '/search',
      '/hot',
      '/bookmarks',
      '/settings',
      '/profile',
      '/post',
      '/logout',
    ],
    redirectTo: '/home',
  },
  HOME_ROUTES: {
    HOME: '/home',
  },
  getProfileRoute: vi.fn(),
  PROFILE_PAGE_PATHS: {
    posts: '/posts',
    replies: '/replies',
    followers: '/followers',
    following: '/following',
    friends: '/friends',
    tagged: '/tagged',
    profile: '/profile',
  },
}));

vi.mock('@/app', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app')>();
  return {
    ...actual,
    ROOT_ROUTES: '/',
    ONBOARDING_ROUTES: {
      BACKUP: '/onboarding/backup',
      HOMESERVER: '/onboarding/homeserver',
      INSTALL: '/onboarding/install',
      PROFILE: '/onboarding/profile',
      PUBKY: '/onboarding/pubky',
      SCAN: '/onboarding/scan',
    },
    AUTH_ROUTES: {
      SIGN_IN: '/sign-in',
      LOGOUT: '/logout',
    },
    APP_ROUTES: {
      HOME: '/home',
      SEARCH: '/search',
      HOT: '/hot',
      BOOKMARKS: '/bookmarks',
      SETTINGS: '/settings',
      PROFILE: '/profile',
    },
    PROFILE_ROUTES: {
      PROFILE: '/profile',
      NOTIFICATIONS: '/profile/notifications',
      POSTS: '/profile/posts',
      REPLIES: '/profile/replies',
      FOLLOWERS: '/profile/followers',
      FOLLOWING: '/profile/following',
      FRIENDS: '/profile/friends',
      UNIQUE_TAGS: '/profile/tagged',
      PROFILE_PAGE: '/profile/profile',
    },
    SETTINGS_ROUTES: {
      ACCOUNT: '/settings/account',
      EDIT: '/settings/edit',
      NOTIFICATIONS: '/settings/notifications',
      PRIVACY_SAFETY: '/settings/privacy-safety',
      MUTED_USERS: '/settings/muted-users',
      LANGUAGE: '/settings/language',
      HELP: '/settings/help',
    },
    POST_ROUTES: {
      POST: '/post',
    },
    PUBLIC_ROUTES: ['/logout'],
    ALLOWED_ROUTES: [
      '/onboarding/profile',
      '/home',
      '/search',
      '/hot',
      '/bookmarks',
      '/settings',
      '/profile',
      '/post',
      '/logout',
    ],
    UNAUTHENTICATED_ROUTES: {
      allowedRoutes: [
        '/',
        '/sign-in',
        '/onboarding/install',
        '/onboarding/scan',
        '/onboarding/pubky',
        '/onboarding/backup',
        '/onboarding/homeserver',
        '/logout',
      ],
      redirectTo: '/',
    },
    NEEDS_PROFILE_CREATION_ROUTES: {
      allowedRoutes: ['/onboarding/profile'],
      redirectTo: '/onboarding/profile',
    },
    AUTHENTICATED_ROUTES: {
      allowedRoutes: [
        '/onboarding/profile',
        '/home',
        '/search',
        '/hot',
        '/bookmarks',
        '/settings',
        '/profile',
        '/post',
        '/logout',
      ],
      redirectTo: '/home',
    },
    HOME_ROUTES: {
      HOME: '/home',
    },
    getProfileRoute: vi.fn(),
    PROFILE_PAGE_PATHS: {
      posts: '/posts',
      replies: '/replies',
      followers: '/followers',
      following: '/following',
      friends: '/friends',
      tagged: '/tagged',
      profile: '/profile',
    },
  };
});

// Mock Hooks
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useCurrentUserProfile: vi.fn(() => ({
      currentUserPubky: mockCurrentUserPubky.current,
    })),
    usePostDetails: vi.fn(() => ({
      postDetails: mockPostDetails.current,
    })),
    useUserDetails: vi.fn(() => ({
      userDetails: mockUserDetails.current,
    })),
    useIsFollowing: vi.fn(() => ({
      isFollowing: mockIsFollowing.current,
    })),
    useFollowUser: vi.fn(() => ({
      toggleFollow: mockToggleFollow,
      isUserLoading: mockIsFollowUserLoading,
    })),
    useMuteUser: vi.fn(() => ({
      isMuted: mockIsMuted.current,
      toggleMute: mockToggleMute,
      isUserLoading: mockIsMuteUserLoading,
    })),
    useCopyToClipboard: vi.fn(() => ({
      copyToClipboard: mockCopyToClipboard,
    })),
  };
});

// Mock Molecules
vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    toast: mockToast,
  };
});

// Mock Libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    Logger: {
      ...actual.Logger,
      error: mockLoggerError,
    },
  };
});

describe('usePostMenuActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockCurrentUserPubky('pk:current-user');
    mockParseCompositeId.mockReturnValue({ pubky: 'pk:author', id: 'post-123' });
    setMockPostDetails({ id: 'post-123', content: 'Test post content', kind: 'short' });
    setMockUserDetails({ id: 'pk:author', name: 'Test User' });
    setMockIsFollowing(false);
    setMockIsMuted(false);
    mockCopyToClipboard.mockResolvedValue(true);
    mockToggleFollow.mockResolvedValue(undefined);
    mockToggleMute.mockResolvedValue(undefined);
    mockCommitDelete.mockResolvedValue(undefined);
    mockIsFollowUserLoading.mockReturnValue(false);
    mockIsMuteUserLoading.mockReturnValue(false);
  });

  describe('Initial State', () => {
    it('should return loading state when authorId is missing', () => {
      mockParseCompositeId.mockImplementation(() => {
        throw new Error('Invalid composite ID');
      });

      const { result } = renderHook(() => usePostMenuActions('invalid-id'));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.menuItems).toEqual([]);
    });

    it('should return loading state when userDetails is missing', () => {
      setMockUserDetails(null);

      const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.menuItems).toEqual([]);
    });

    it('should return menu items when data is loaded', () => {
      const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.menuItems.length).toBeGreaterThan(0);
    });
  });

  describe('Menu Items - Other User Post', () => {
    beforeEach(() => {
      setMockCurrentUserPubky('pk:current-user');
      mockParseCompositeId.mockReturnValue({ pubky: 'pk:author', id: 'post-123' });
    });

    it('should show follow action when not following', () => {
      setMockIsFollowing(false);
      const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

      const followItem = result.current.menuItems.find((item) => item.id === 'follow');
      expect(followItem).toBeDefined();
      expect(followItem?.label).toContain('Follow');
    });

    it('should show unfollow action when following', () => {
      setMockIsFollowing(true);
      const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

      const followItem = result.current.menuItems.find((item) => item.id === 'follow');
      expect(followItem).toBeDefined();
      expect(followItem?.label).toContain('Unfollow');
    });

    it('should show mute action when not muted', () => {
      setMockIsMuted(false);
      const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

      const muteItem = result.current.menuItems.find((item) => item.id === 'mute');
      expect(muteItem).toBeDefined();
      expect(muteItem?.label).toContain('Mute user');
    });

    it('should show unmute action when muted', () => {
      setMockIsMuted(true);
      const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

      const muteItem = result.current.menuItems.find((item) => item.id === 'mute');
      expect(muteItem).toBeDefined();
      expect(muteItem?.label).toContain('Unmute user');
    });

    it('should not show edit or delete actions for other user posts', () => {
      const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

      const editItem = result.current.menuItems.find((item) => item.id === 'edit');
      const deleteItem = result.current.menuItems.find((item) => item.id === 'delete');

      expect(editItem).toBeUndefined();
      expect(deleteItem).toBeUndefined();
    });

    it('should show copy actions for other user posts', () => {
      const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

      const copyPubkyItem = result.current.menuItems.find((item) => item.id === 'copy-pubky');
      const copyLinkItem = result.current.menuItems.find((item) => item.id === 'copy-link');
      const copyTextItem = result.current.menuItems.find((item) => item.id === 'copy-text');

      expect(copyPubkyItem).toBeDefined();
      expect(copyLinkItem).toBeDefined();
      expect(copyTextItem).toBeDefined();
    });

    it('should show report action for other user posts', () => {
      const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

      const reportItem = result.current.menuItems.find((item) => item.id === 'report');
      expect(reportItem).toBeDefined();
      expect(reportItem?.disabled).toBe(true);
    });
  });

  describe('Menu Items - Own Post', () => {
    beforeEach(() => {
      setMockCurrentUserPubky('pk:current-user');
      mockParseCompositeId.mockReturnValue({ pubky: 'pk:current-user', id: 'post-123' });
    });

    it('should show edit and delete actions for own posts', () => {
      const { result } = renderHook(() => usePostMenuActions('pk:current-user:post-123'));

      const editItem = result.current.menuItems.find((item) => item.id === 'edit');
      const deleteItem = result.current.menuItems.find((item) => item.id === 'delete');

      expect(editItem).toBeDefined();
      expect(editItem?.disabled).toBe(true);
      expect(deleteItem).toBeDefined();
      expect(deleteItem?.destructive).toBe(true);
    });

    it('should not show follow or mute actions for own posts', () => {
      const { result } = renderHook(() => usePostMenuActions('pk:current-user:post-123'));

      const followItem = result.current.menuItems.find((item) => item.id === 'follow');
      const muteItem = result.current.menuItems.find((item) => item.id === 'mute');

      expect(followItem).toBeUndefined();
      expect(muteItem).toBeUndefined();
    });

    it('should show edit article label for long posts', () => {
      setMockPostDetails({ id: 'post-123', content: 'Long content', kind: 'long' });
      const { result } = renderHook(() => usePostMenuActions('pk:current-user:post-123'));

      const editItem = result.current.menuItems.find((item) => item.id === 'edit');
      expect(editItem?.label).toBe('Edit article');
    });

    it('should show edit post label for short posts', () => {
      setMockPostDetails({ id: 'post-123', content: 'Short content', kind: 'short' });
      const { result } = renderHook(() => usePostMenuActions('pk:current-user:post-123'));

      const editItem = result.current.menuItems.find((item) => item.id === 'edit');
      expect(editItem?.label).toBe('Edit post');
    });

    it('should not show copy text action for articles', () => {
      setMockPostDetails({ id: 'post-123', content: 'Long content', kind: 'long' });
      const { result } = renderHook(() => usePostMenuActions('pk:current-user:post-123'));

      const copyTextItem = result.current.menuItems.find((item) => item.id === 'copy-text');
      expect(copyTextItem).toBeUndefined();
    });
  });

  describe('Handlers', () => {
    describe('handleFollow', () => {
      it('should call toggleFollow and show success toast', async () => {
        setMockIsFollowing(false);
        const onClose = vi.fn();
        const { result } = renderHook(() => usePostMenuActions('pk:author:post-123', onClose));

        const followItem = result.current.menuItems.find((item) => item.id === 'follow');
        expect(followItem).toBeDefined();

        await act(async () => {
          followItem?.onClick();
        });

        await waitFor(() => {
          expect(mockToggleFollow).toHaveBeenCalledWith('pk:author', false);
          expect(mockToast).toHaveBeenCalledWith({
            title: 'Following',
            description: 'You are now following Test User',
          });
          expect(onClose).toHaveBeenCalled();
        });
      });

      it('should handle follow error', async () => {
        setMockIsFollowing(false);
        mockToggleFollow.mockRejectedValueOnce(new Error('Follow failed'));
        const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

        const followItem = result.current.menuItems.find((item) => item.id === 'follow');

        await act(async () => {
          followItem?.onClick();
        });

        await waitFor(() => {
          expect(mockLoggerError).toHaveBeenCalledWith('[PostMenuActions] Failed to toggle follow:', expect.any(Error));
          expect(mockToast).toHaveBeenCalledWith({
            title: 'Error',
            description: 'Failed to update follow status',
          });
        });
      });
    });

    describe('handleMute', () => {
      it('should call toggleMute and show success toast', async () => {
        setMockIsMuted(false);
        const onClose = vi.fn();
        const { result } = renderHook(() => usePostMenuActions('pk:author:post-123', onClose));

        const muteItem = result.current.menuItems.find((item) => item.id === 'mute');
        expect(muteItem).toBeDefined();

        await act(async () => {
          muteItem?.onClick();
        });

        await waitFor(() => {
          expect(mockToggleMute).toHaveBeenCalledWith('pk:author', false);
          expect(mockToast).toHaveBeenCalledWith({
            title: 'Muted',
            description: 'You muted Test User',
          });
          expect(onClose).toHaveBeenCalled();
        });
      });

      it('should handle mute error', async () => {
        setMockIsMuted(false);
        mockToggleMute.mockRejectedValueOnce(new Error('Mute failed'));
        const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

        const muteItem = result.current.menuItems.find((item) => item.id === 'mute');

        await act(async () => {
          muteItem?.onClick();
        });

        await waitFor(() => {
          expect(mockLoggerError).toHaveBeenCalledWith('[PostMenuActions] Failed to toggle mute:', expect.any(Error));
          expect(mockToast).toHaveBeenCalledWith({
            title: 'Error',
            description: 'Failed to update mute status',
          });
        });
      });
    });

    describe('handleCopyPubky', () => {
      it('should copy pubky to clipboard', async () => {
        const onClose = vi.fn();
        const { result } = renderHook(() => usePostMenuActions('pk:author:post-123', onClose));

        const copyPubkyItem = result.current.menuItems.find((item) => item.id === 'copy-pubky');

        await act(async () => {
          copyPubkyItem?.onClick();
        });

        await waitFor(() => {
          expect(mockCopyToClipboard).toHaveBeenCalledWith('pk:author');
          expect(onClose).toHaveBeenCalled();
        });
      });

      it('should not close menu if copy fails', async () => {
        mockCopyToClipboard.mockResolvedValueOnce(false);
        const onClose = vi.fn();
        const { result } = renderHook(() => usePostMenuActions('pk:author:post-123', onClose));

        const copyPubkyItem = result.current.menuItems.find((item) => item.id === 'copy-pubky');

        await act(async () => {
          copyPubkyItem?.onClick();
        });

        await waitFor(() => {
          expect(mockCopyToClipboard).toHaveBeenCalledWith('pk:author');
          expect(onClose).not.toHaveBeenCalled();
        });
      });
    });

    describe('handleCopyLink', () => {
      it('should copy post link to clipboard', async () => {
        Object.defineProperty(window, 'location', {
          value: { origin: 'https://example.com' },
          writable: true,
        });

        const onClose = vi.fn();
        const { result } = renderHook(() => usePostMenuActions('pk:author:post-123', onClose));

        const copyLinkItem = result.current.menuItems.find((item) => item.id === 'copy-link');

        await act(async () => {
          copyLinkItem?.onClick();
        });

        await waitFor(() => {
          expect(mockCopyToClipboard).toHaveBeenCalledWith('https://example.com/post/pk:author/post-123');
          expect(onClose).toHaveBeenCalled();
        });
      });
    });

    describe('handleCopyText', () => {
      it('should copy post text to clipboard', async () => {
        setMockPostDetails({ id: 'post-123', content: 'Test content', kind: 'short' });
        const onClose = vi.fn();
        const { result } = renderHook(() => usePostMenuActions('pk:author:post-123', onClose));

        const copyTextItem = result.current.menuItems.find((item) => item.id === 'copy-text');

        await act(async () => {
          copyTextItem?.onClick();
        });

        await waitFor(() => {
          expect(mockCopyToClipboard).toHaveBeenCalledWith('Test content');
          expect(onClose).toHaveBeenCalled();
        });
      });

      it('should not copy if content is missing', async () => {
        setMockPostDetails({ id: 'post-123', content: '', kind: 'short' });
        const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

        const copyTextItem = result.current.menuItems.find((item) => item.id === 'copy-text');

        await act(async () => {
          copyTextItem?.onClick();
        });

        expect(mockCopyToClipboard).not.toHaveBeenCalled();
      });
    });

    describe('handleDelete', () => {
      it('should delete post and show success toast', async () => {
        setMockCurrentUserPubky('pk:current-user');
        mockParseCompositeId.mockReturnValue({ pubky: 'pk:current-user', id: 'post-123' });
        const onClose = vi.fn();
        const { result } = renderHook(() => usePostMenuActions('pk:current-user:post-123', onClose));

        const deleteItem = result.current.menuItems.find((item) => item.id === 'delete');

        await act(async () => {
          deleteItem?.onClick();
        });

        await waitFor(() => {
          expect(mockCommitDelete).toHaveBeenCalledWith({ compositePostId: 'pk:current-user:post-123' });
          expect(mockToast).toHaveBeenCalledWith({
            title: 'Post deleted',
            description: 'Your post has been deleted',
          });
          expect(onClose).toHaveBeenCalled();
        });
      });

      it('should handle delete error', async () => {
        setMockCurrentUserPubky('pk:current-user');
        mockParseCompositeId.mockReturnValue({ pubky: 'pk:current-user', id: 'post-123' });
        mockCommitDelete.mockRejectedValueOnce(new Error('Delete failed'));
        const { result } = renderHook(() => usePostMenuActions('pk:current-user:post-123'));

        const deleteItem = result.current.menuItems.find((item) => item.id === 'delete');

        await act(async () => {
          deleteItem?.onClick();
        });

        await waitFor(() => {
          expect(mockLoggerError).toHaveBeenCalledWith('[PostMenuActions] Failed to delete post:', expect.any(Error));
          expect(mockToast).toHaveBeenCalledWith({
            title: 'Error',
            description: 'Failed to delete post',
          });
        });
      });

      it('should not delete if not own post', async () => {
        setMockCurrentUserPubky('pk:current-user');
        mockParseCompositeId.mockReturnValue({ pubky: 'pk:other-user', id: 'post-123' });
        const { result } = renderHook(() => usePostMenuActions('pk:other-user:post-123'));

        const deleteItem = result.current.menuItems.find((item) => item.id === 'delete');
        expect(deleteItem).toBeUndefined();
      });
    });

    describe('handleEdit', () => {
      it('should call onClose when edit is clicked', () => {
        setMockCurrentUserPubky('pk:current-user');
        mockParseCompositeId.mockReturnValue({ pubky: 'pk:current-user', id: 'post-123' });
        const onClose = vi.fn();
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const { result } = renderHook(() => usePostMenuActions('pk:current-user:post-123', onClose));

        const editItem = result.current.menuItems.find((item) => item.id === 'edit');

        act(() => {
          editItem?.onClick();
        });

        expect(consoleSpy).toHaveBeenCalledWith('[PostMenuActions] Edit post clicked', {
          postId: 'pk:current-user:post-123',
        });
        expect(onClose).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });

    describe('handleReport', () => {
      it('should call onClose when report is clicked', () => {
        const onClose = vi.fn();
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const { result } = renderHook(() => usePostMenuActions('pk:author:post-123', onClose));

        const reportItem = result.current.menuItems.find((item) => item.id === 'report');

        act(() => {
          reportItem?.onClick();
        });

        expect(consoleSpy).toHaveBeenCalledWith('[PostMenuActions] Report post clicked', {
          postId: 'pk:author:post-123',
        });
        expect(onClose).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });
  });

  describe('Loading States', () => {
    it('should disable follow button when loading', () => {
      mockIsFollowUserLoading.mockReturnValue(true);
      const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

      const followItem = result.current.menuItems.find((item) => item.id === 'follow');
      expect(followItem?.disabled).toBe(true);
    });

    it('should disable mute button when loading', () => {
      mockIsMuteUserLoading.mockReturnValue(true);
      const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

      const muteItem = result.current.menuItems.find((item) => item.id === 'mute');
      expect(muteItem?.disabled).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing onClose callback', async () => {
      const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

      const copyPubkyItem = result.current.menuItems.find((item) => item.id === 'copy-pubky');

      await act(async () => {
        copyPubkyItem?.onClick();
      });

      // Should not throw error
      expect(mockCopyToClipboard).toHaveBeenCalled();
    });

    it('should handle invalid composite post ID', () => {
      mockParseCompositeId.mockImplementation(() => {
        throw new Error('Invalid ID');
      });

      const { result } = renderHook(() => usePostMenuActions('invalid-id'));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.menuItems).toEqual([]);
    });

    it('should handle user without name', () => {
      setMockUserDetails({ id: 'pk:author', name: '' });
      const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

      const followItem = result.current.menuItems.find((item) => item.id === 'follow');
      expect(followItem?.label).toContain('Follow');
    });
  });
});

describe('usePostMenuActions - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockCurrentUserPubky('pk:current-user');
    mockParseCompositeId.mockReturnValue({ pubky: 'pk:author', id: 'post-123' });
    setMockPostDetails({ id: 'post-123', content: 'Test content', kind: 'short' });
    setMockUserDetails({ id: 'pk:author', name: 'Test User' });
    setMockIsFollowing(false);
    setMockIsMuted(false);
    mockIsFollowUserLoading.mockReturnValue(false);
    mockIsMuteUserLoading.mockReturnValue(false);
  });

  it('matches snapshot for other user post', () => {
    const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

    expect(result.current).toMatchSnapshot();
  });

  it('matches snapshot for own post', () => {
    setMockCurrentUserPubky('pk:current-user');
    mockParseCompositeId.mockReturnValue({ pubky: 'pk:current-user', id: 'post-123' });
    const { result } = renderHook(() => usePostMenuActions('pk:current-user:post-123'));

    expect(result.current).toMatchSnapshot();
  });

  it('matches snapshot for article post', () => {
    setMockPostDetails({ id: 'post-123', content: 'Long content', kind: 'long' });
    setMockCurrentUserPubky('pk:current-user');
    mockParseCompositeId.mockReturnValue({ pubky: 'pk:current-user', id: 'post-123' });
    const { result } = renderHook(() => usePostMenuActions('pk:current-user:post-123'));

    expect(result.current).toMatchSnapshot();
  });

  it('matches snapshot for loading state', () => {
    setMockUserDetails(null);
    const { result } = renderHook(() => usePostMenuActions('pk:author:post-123'));

    expect(result.current).toMatchSnapshot();
  });
});
