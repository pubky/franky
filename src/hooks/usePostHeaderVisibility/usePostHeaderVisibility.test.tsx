import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePostHeaderVisibility } from './usePostHeaderVisibility';
import * as Hooks from '@/hooks';

// Mock the hooks that usePostHeaderVisibility depends on
vi.mock('@/hooks/usePostDetails', () => ({
  usePostDetails: vi.fn(),
}));

vi.mock('@/hooks/useRepostInfo', () => ({
  useRepostInfo: vi.fn(),
}));

// Helper to create complete PostDetails mock
const createMockPostDetails = (overrides: Partial<{ content: string; attachments: string[] | null }> = {}) => ({
  id: 'test-author:test-post',
  indexed_at: Date.now(),
  kind: 'short' as const,
  uri: 'pubky://test-author/pub/pubky.app/posts/test-post',
  content: '',
  attachments: null as string[] | null,
  ...overrides,
});

describe('usePostHeaderVisibility', () => {
  const mockUsePostDetails = vi.mocked(Hooks.usePostDetails);
  const mockUseRepostInfo = vi.mocked(Hooks.useRepostInfo);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows both headers for regular post (not a repost)', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: createMockPostDetails({ content: 'Regular post content' }),
      isLoading: false,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: false,
      repostAuthorId: null,
      isCurrentUserRepost: false,
      originalPostId: null,
      isLoading: false,
      hasError: false,
    });

    const { result } = renderHook(() => usePostHeaderVisibility('user:post-1'));

    expect(result.current.showRepostHeader).toBe(false);
    expect(result.current.shouldShowPostHeader).toBe(true);
  });

  it('hides PostHeader for simple repost (no content) by current user', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: createMockPostDetails({ content: '' }),
      isLoading: false,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: true,
      repostAuthorId: 'me',
      isCurrentUserRepost: true,
      originalPostId: 'orig',
      isLoading: false,
      hasError: false,
    });

    const { result } = renderHook(() => usePostHeaderVisibility('me:repost-1'));

    expect(result.current.showRepostHeader).toBe(true);
    expect(result.current.shouldShowPostHeader).toBe(false);
  });

  it('shows PostHeader for quote repost (with text content) by current user', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: createMockPostDetails({ content: 'This is a quote repost' }),
      isLoading: false,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: true,
      repostAuthorId: 'me',
      isCurrentUserRepost: true,
      originalPostId: 'orig',
      isLoading: false,
      hasError: false,
    });

    const { result } = renderHook(() => usePostHeaderVisibility('me:quote-repost-1'));

    expect(result.current.showRepostHeader).toBe(true);
    expect(result.current.shouldShowPostHeader).toBe(true);
  });

  it('shows PostHeader for repost with attachments but no text by current user', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: {
        id: 'me:repost-with-attachments-1',
        content: '',
        attachments: ['attachment-1', 'attachment-2'],
        indexed_at: Date.now(),
        kind: 'short',
        uri: 'https://example.com/post/me:repost-with-attachments-1',
      },
      isLoading: false,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: true,
      repostAuthorId: 'me',
      isCurrentUserRepost: true,
      originalPostId: 'orig',
      isLoading: false,
      hasError: false,
    });

    const { result } = renderHook(() => usePostHeaderVisibility('me:repost-with-attachments-1'));

    expect(result.current.showRepostHeader).toBe(true);
    expect(result.current.shouldShowPostHeader).toBe(true);
  });

  it('hides PostHeader for repost with only whitespace content by current user', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: {
        id: 'me:repost-whitespace-1',
        content: '   \n\t  ',
        attachments: null,
        indexed_at: Date.now(),
        kind: 'short',
        uri: 'https://example.com/post/me:repost-whitespace-1',
      },
      isLoading: false,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: true,
      repostAuthorId: 'me',
      isCurrentUserRepost: true,
      originalPostId: 'orig',
      isLoading: false,
      hasError: false,
    });

    const { result } = renderHook(() => usePostHeaderVisibility('me:whitespace-repost-1'));

    expect(result.current.showRepostHeader).toBe(true);
    expect(result.current.shouldShowPostHeader).toBe(false);
  });

  it('shows PostHeader for repost by another user even without content', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: createMockPostDetails({ content: '' }),
      isLoading: false,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: true,
      repostAuthorId: 'other-user',
      isCurrentUserRepost: false,
      originalPostId: 'orig',
      isLoading: false,
      hasError: false,
    });

    const { result } = renderHook(() => usePostHeaderVisibility('other-user:repost-1'));

    expect(result.current.showRepostHeader).toBe(false);
    expect(result.current.shouldShowPostHeader).toBe(true);
  });

  it('shows PostHeader when postDetails is loading (undefined)', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: undefined,
      isLoading: true,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: true,
      repostAuthorId: 'me',
      isCurrentUserRepost: true,
      originalPostId: 'orig',
      isLoading: false,
      hasError: false,
    });

    const { result } = renderHook(() => usePostHeaderVisibility('me:loading-repost-1'));

    // When loading, show header to avoid layout shift
    expect(result.current.showRepostHeader).toBe(true);
    expect(result.current.shouldShowPostHeader).toBe(true);
  });

  it('shows PostHeader when postDetails is null', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: null,
      isLoading: false,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: true,
      repostAuthorId: 'me',
      isCurrentUserRepost: true,
      originalPostId: 'orig',
      isLoading: false,
      hasError: false,
    });

    const { result } = renderHook(() => usePostHeaderVisibility('me:null-repost-1'));

    // When null, show header to avoid layout shift
    expect(result.current.showRepostHeader).toBe(true);
    expect(result.current.shouldShowPostHeader).toBe(true);
  });
});
