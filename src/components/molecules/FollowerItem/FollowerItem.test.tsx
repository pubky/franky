import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FollowerItem } from './FollowerItem';
import type { FollowerData } from '@/hooks/useFollowers';
import * as Core from '@/core';

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Typography: ({ children, as, className }: { children: React.ReactNode; as?: string; className?: string }) => {
    const Tag = as || 'p';
    return (
      <Tag data-testid="typography" className={className}>
        {children}
      </Tag>
    );
  },
  Button: ({
    children,
    className,
    onClick,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    'aria-label'?: string;
  }) => (
    <button data-testid="button" className={className} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  ),
  Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a data-testid="link" href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  AvatarWithFallback: ({
    avatarUrl,
    name,
    size,
    className,
  }: {
    avatarUrl?: string;
    name: string;
    size?: string;
    className?: string;
  }) => (
    <div
      data-testid="avatar-with-fallback"
      data-name={name}
      data-avatar={avatarUrl}
      data-size={size}
      className={className}
    >
      {avatarUrl ? <img src={avatarUrl} alt={name} /> : <span>{name[0]}</span>}
    </div>
  ),
  PostTag: ({ label }: { label: string }) => <span data-testid="post-tag">{label}</span>,
}));

// Mock libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    formatPublicKey: vi.fn(({ key }: { key: string }) => key.substring(0, 10)),
    cn: vi.fn((...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')),
  };
});

// Mock core
vi.mock('@/core', () => ({
  generateTestUserId: vi.fn((index: number) => `test-user-${index}`),
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Check: ({ className }: { className?: string }) => <svg data-testid="check-icon" className={className} />,
  UserMinus: ({ className }: { className?: string }) => <svg data-testid="user-minus-icon" className={className} />,
  UserRoundPlus: ({ className }: { className?: string }) => (
    <svg data-testid="user-round-plus-icon" className={className} />
  ),
}));

describe('FollowerItem', () => {
  const mockFollower: FollowerData = {
    id: 'test-user-1' as Core.Pubky,
    name: 'John Doe',
    bio: 'Test bio',
    image: null,
    status: 'active',
    links: null,
    indexed_at: 1704067200000,
    tags: ['bitcoin', 'candid'],
    stats: {
      tags: 100,
      posts: 50,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders follower name', () => {
    render(<FollowerItem follower={mockFollower} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders formatted public key', () => {
    render(<FollowerItem follower={mockFollower} />);
    // formatPublicKey truncates to 10 chars, so "test-user-1" becomes "test-user-"
    expect(screen.getByText(/test-user/i)).toBeInTheDocument();
  });

  it('renders avatar with fallback', () => {
    render(<FollowerItem follower={mockFollower} />);
    const avatar = screen.getByTestId('avatar-with-fallback');
    expect(avatar).toHaveAttribute('data-name', 'John Doe');
  });

  it('renders stats', () => {
    render(<FollowerItem follower={mockFollower} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText(/Tags/i)).toBeInTheDocument();
    expect(screen.getByText(/Posts/i)).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(<FollowerItem follower={mockFollower} />);
    // Tags are hidden on mobile (lg:flex), so we check for the tags in the mobile section
    const tags = screen.getAllByTestId('post-tag');
    // Tags appear twice - once in desktop section (hidden) and once in mobile section
    expect(tags.length).toBeGreaterThanOrEqual(2);
    const bitcoinTags = screen.getAllByText('bitcoin');
    const candidTags = screen.getAllByText('candid');
    expect(bitcoinTags.length).toBeGreaterThan(0);
    expect(candidTags.length).toBeGreaterThan(0);
  });

  it('renders link to profile', () => {
    render(<FollowerItem follower={mockFollower} />);
    const link = screen.getByTestId('link');
    expect(link).toHaveAttribute('href', '/profile/test-user-1');
  });

  it('renders follow button when not following', () => {
    render(<FollowerItem follower={mockFollower} isFollowing={false} />);
    const buttons = screen.getAllByTestId('button');
    const followButton = buttons.find((btn) => btn.getAttribute('aria-label') === 'Follow');
    expect(followButton).toBeInTheDocument();
    // Button appears twice (desktop and mobile), so we check for at least one
    const plusIcons = screen.getAllByTestId('user-round-plus-icon');
    expect(plusIcons.length).toBeGreaterThan(0);
  });

  it('renders unfollow button when following', () => {
    render(<FollowerItem follower={mockFollower} isFollowing={true} />);
    const buttons = screen.getAllByTestId('button');
    const unfollowButton = buttons.find((btn) => btn.getAttribute('aria-label') === 'Unfollow');
    expect(unfollowButton).toBeInTheDocument();
    // Button appears twice (desktop and mobile), so we check for at least one
    const checkIcons = screen.getAllByTestId('check-icon');
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it('calls onFollow when button is clicked', () => {
    const onFollow = vi.fn();
    render(<FollowerItem follower={mockFollower} onFollow={onFollow} />);
    const buttons = screen.getAllByTestId('button');
    const followButton = buttons.find((btn) => btn.getAttribute('aria-label') === 'Unfollow');
    fireEvent.click(followButton!);
    expect(onFollow).toHaveBeenCalledWith('test-user-1');
  });

  it('handles follower without tags', () => {
    const followerWithoutTags = { ...mockFollower, tags: [] };
    render(<FollowerItem follower={followerWithoutTags} />);
    const tags = screen.queryAllByTestId('post-tag');
    expect(tags).toHaveLength(0);
  });

  it('handles follower without stats', () => {
    const followerWithoutStats = { ...mockFollower, stats: { tags: 0, posts: 0 } };
    render(<FollowerItem follower={followerWithoutStats} />);
    // Stats are always shown, even if 0
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(2); // Tags and Posts both show 0
  });

  it('limits tags to 3', () => {
    const followerWithManyTags = {
      ...mockFollower,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };
    render(<FollowerItem follower={followerWithManyTags} />);
    const tags = screen.getAllByTestId('post-tag');
    // Tags appear twice (desktop and mobile), so we check that we have at most 6 (3 * 2)
    expect(tags.length).toBeLessThanOrEqual(6);
    // But each section should only show 3 tags
    const uniqueTags = new Set(tags.map((tag) => tag.textContent));
    expect(uniqueTags.size).toBeLessThanOrEqual(3);
  });
});

describe('FollowerItem - Snapshots', () => {
  const mockFollower: FollowerData = {
    id: 'test-user-1' as Core.Pubky,
    name: 'John Doe',
    bio: 'Test bio',
    image: null,
    status: 'active',
    links: null,
    indexed_at: 1704067200000,
    tags: ['bitcoin', 'candid'],
    stats: {
      tags: 100,
      posts: 50,
    },
  };

  it('matches snapshot when following', () => {
    const { container } = render(<FollowerItem follower={mockFollower} isFollowing={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when not following', () => {
    const { container } = render(<FollowerItem follower={mockFollower} isFollowing={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without tags', () => {
    const followerWithoutTags = { ...mockFollower, tags: [] };
    const { container } = render(<FollowerItem follower={followerWithoutTags} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
