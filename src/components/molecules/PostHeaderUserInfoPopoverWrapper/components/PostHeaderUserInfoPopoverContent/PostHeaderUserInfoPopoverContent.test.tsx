import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostHeaderUserInfoPopoverContent } from './PostHeaderUserInfoPopoverContent';

vi.mock('@/hooks/usePostHeaderUserInfoPopoverData', () => ({
  usePostHeaderUserInfoPopoverData: () => ({
    isCurrentUser: false,
    isLoading: false,
    profileBio: 'Bio',
    profileAvatarUrl: 'profile-avatar',
    followers: [],
    following: [],
    followersCount: 0,
    followingCount: 0,
    statsFollowers: 0,
    statsFollowing: 0,
    isFollowing: false,
    isFollowingStatusLoading: false,
  }),
}));

vi.mock('@/hooks/usePostHeaderUserInfoPopoverActions', () => ({
  usePostHeaderUserInfoPopoverActions: () => ({
    isLoading: false,
    onEditClick: vi.fn(),
    onFollowClick: vi.fn(),
  }),
}));

vi.mock('@/molecules', () => ({
  PostText: ({ content }: { content: string }) => <div data-testid="post-text">{content}</div>,
}));

vi.mock('../PostHeaderUserInfoPopoverHeader', () => ({
  PostHeaderUserInfoPopoverHeader: () => <div data-testid="header" />,
}));
vi.mock('../PostHeaderUserInfoPopoverStats', () => ({
  PostHeaderUserInfoPopoverStats: () => <div data-testid="stats" />,
}));
vi.mock('../PostHeaderUserInfoPopoverFollowButton', () => ({
  PostHeaderUserInfoPopoverFollowButton: () => <div data-testid="follow-button" />,
}));
vi.mock('../PostHeaderUserInfoPopoverSkeleton', () => ({
  PostHeaderUserInfoPopoverSkeleton: () => <div data-testid="skeleton" />,
}));
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual, Pencil: () => <svg data-testid="icon-pencil" /> };
});

describe('PostHeaderUserInfoPopoverContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all sections', () => {
    render(
      <PostHeaderUserInfoPopoverContent
        userId="user123"
        userName="User"
        avatarUrl="avatar"
        formattedPublicKey="pubkey"
      />,
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('stats')).toBeInTheDocument();
    // actions are inline now: follow button should exist for non-current user
    expect(screen.getByTestId('follow-button')).toBeInTheDocument();
  });
});

describe('PostHeaderUserInfoPopoverContent - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <PostHeaderUserInfoPopoverContent
        userId="user123"
        userName="User"
        avatarUrl="avatar"
        formattedPublicKey="pubkey"
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
