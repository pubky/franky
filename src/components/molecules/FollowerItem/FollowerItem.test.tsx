import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FollowerItem, type FollowerData } from './FollowerItem';

// Mock libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
    extractInitials: vi.fn(({ name }: { name: string }) => {
      const parts = name.split(' ');
      return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name[0];
    }),
    Check: ({ className }: { className?: string }) => <div data-testid="check-icon" className={className} />,
    UserRoundPlus: ({ className }: { className?: string }) => (
      <div data-testid="user-round-plus-icon" className={className} />
    ),
  };
});

// Mock atoms
vi.mock('@/atoms', () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" data-class-name={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => <img data-testid="avatar-image" src={src} alt={alt} />,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <div data-testid="avatar-fallback">{children}</div>,
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <p data-testid="typography" data-size={size} data-class-name={className}>
      {children}
    </p>
  ),
  Button: ({
    children,
    onClick,
    variant,
    size,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    size?: string;
    className?: string;
  }) => (
    <button
      data-testid="follow-button"
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      data-class-name={className}
    >
      {children}
    </button>
  ),
  ButtonVariant: {
    SECONDARY: 'secondary',
  },
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  UserStats: ({ tagsCount, postsCount, className }: { tagsCount: number; postsCount: number; className?: string }) => (
    <div data-testid="user-stats" data-class-name={className}>
      <span data-testid="tags-count">{tagsCount}</span>
      <span data-testid="posts-count">{postsCount}</span>
    </div>
  ),
  PostTag: ({ label, color, className }: { label: string; color?: string; className?: string }) => (
    <div data-testid={`post-tag-${label}`} data-color={color} data-class-name={className}>
      {label}
    </div>
  ),
}));

const mockFollower: FollowerData = {
  id: '1',
  name: 'Matt Jones',
  pubky: '1RX3...KO43',
  avatar: 'https://i.pravatar.cc/150?img=1',
  tags: [
    { label: 'bitcoin', color: '#004BFF' },
    { label: 'crypto', color: '#FF9900' },
    { label: 'hot', color: '#FF0000' },
  ],
  tagsCount: 761,
  postsCount: 158,
  isFollowing: true,
};

describe('FollowerItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders follower information correctly', () => {
    render(<FollowerItem follower={mockFollower} />);

    expect(screen.getByText('Matt Jones')).toBeInTheDocument();
    expect(screen.getByText('1RX3...KO43')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('renders avatar with image', () => {
    render(<FollowerItem follower={mockFollower} />);

    const avatarImage = screen.getByTestId('avatar-image');
    expect(avatarImage).toHaveAttribute('src', mockFollower.avatar);
    expect(avatarImage).toHaveAttribute('alt', mockFollower.name);
  });

  it('renders avatar fallback when no image', () => {
    const followerWithoutAvatar = { ...mockFollower, avatar: undefined };
    render(<FollowerItem follower={followerWithoutAvatar} />);

    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    expect(screen.getByText('MJ')).toBeInTheDocument(); // Initials
  });

  it('renders tags', () => {
    render(<FollowerItem follower={mockFollower} />);

    expect(screen.getByTestId('post-tag-bitcoin')).toBeInTheDocument();
    expect(screen.getByTestId('post-tag-crypto')).toBeInTheDocument();
    expect(screen.getByTestId('post-tag-hot')).toBeInTheDocument();
  });

  it('renders only first 3 tags', () => {
    const followerWithManyTags = {
      ...mockFollower,
      tags: [
        { label: 'tag1', color: '#000' },
        { label: 'tag2', color: '#111' },
        { label: 'tag3', color: '#222' },
        { label: 'tag4', color: '#333' },
        { label: 'tag5', color: '#444' },
      ],
    };
    render(<FollowerItem follower={followerWithManyTags} />);

    expect(screen.getByTestId('post-tag-tag1')).toBeInTheDocument();
    expect(screen.getByTestId('post-tag-tag2')).toBeInTheDocument();
    expect(screen.getByTestId('post-tag-tag3')).toBeInTheDocument();
    expect(screen.queryByTestId('post-tag-tag4')).not.toBeInTheDocument();
    expect(screen.queryByTestId('post-tag-tag5')).not.toBeInTheDocument();
  });

  it('renders user stats with correct counts', () => {
    render(<FollowerItem follower={mockFollower} />);

    const stats = screen.getAllByTestId('user-stats');
    expect(stats.length).toBeGreaterThan(0); // Mobile and desktop versions

    const tagsCount = screen.getAllByTestId('tags-count');
    const postsCount = screen.getAllByTestId('posts-count');

    expect(tagsCount[0]).toHaveTextContent('761');
    expect(postsCount[0]).toHaveTextContent('158');
  });

  it('calls onFollow when follow button is clicked', () => {
    const mockOnFollow = vi.fn();
    render(<FollowerItem follower={mockFollower} onFollow={mockOnFollow} />);

    const followButton = screen.getByTestId('follow-button');
    fireEvent.click(followButton);

    expect(mockOnFollow).toHaveBeenCalledWith('1');
    expect(mockOnFollow).toHaveBeenCalledTimes(1);
  });

  it('does not call onFollow when not provided', () => {
    render(<FollowerItem follower={mockFollower} />);

    const followButton = screen.getByTestId('follow-button');
    fireEvent.click(followButton);

    // Should not throw error
    expect(followButton).toBeInTheDocument();
  });

  it('renders check icon when isFollowing is true', () => {
    render(<FollowerItem follower={mockFollower} />);

    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('user-round-plus-icon')).not.toBeInTheDocument();
  });

  it('renders user round plus icon when isFollowing is false', () => {
    const notFollowingFollower = { ...mockFollower, isFollowing: false };
    render(<FollowerItem follower={notFollowingFollower} />);

    expect(screen.getByTestId('user-round-plus-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
  });

  it('renders without tags', () => {
    const followerWithoutTags = { ...mockFollower, tags: [] };
    render(<FollowerItem follower={followerWithoutTags} />);

    expect(screen.queryByTestId('post-tag-bitcoin')).not.toBeInTheDocument();
    expect(screen.getByText('Matt Jones')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<FollowerItem follower={mockFollower} className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders mobile stats with correct className', () => {
    render(<FollowerItem follower={mockFollower} />);

    const mobileStats = screen.getAllByTestId('user-stats').find((stats) => {
      const className = stats.getAttribute('data-class-name') || '';
      return className.includes('lg:hidden');
    });

    expect(mobileStats).toBeInTheDocument();
  });

  it('renders desktop stats with correct className', () => {
    render(<FollowerItem follower={mockFollower} />);

    const desktopStats = screen.getAllByTestId('user-stats').find((stats) => {
      const className = stats.getAttribute('data-class-name') || '';
      return className.includes('hidden lg:flex');
    });

    expect(desktopStats).toBeInTheDocument();
  });

  it('renders follow button with correct variant and size', () => {
    render(<FollowerItem follower={mockFollower} />);

    const followButton = screen.getByTestId('follow-button');
    expect(followButton).toHaveAttribute('data-variant', 'secondary');
    expect(followButton).toHaveAttribute('data-size', 'sm');
  });
});

describe('FollowerItem - Snapshots', () => {
  it('matches snapshot with following user', () => {
    const { container } = render(<FollowerItem follower={mockFollower} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with not following user', () => {
    const notFollowingFollower = { ...mockFollower, isFollowing: false };
    const { container } = render(<FollowerItem follower={notFollowingFollower} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without tags', () => {
    const followerWithoutTags = { ...mockFollower, tags: [] };
    const { container } = render(<FollowerItem follower={followerWithoutTags} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without avatar', () => {
    const followerWithoutAvatar = { ...mockFollower, avatar: undefined };
    const { container } = render(<FollowerItem follower={followerWithoutAvatar} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with many tags', () => {
    const followerWithManyTags = {
      ...mockFollower,
      tags: [
        { label: 'tag1', color: '#000' },
        { label: 'tag2', color: '#111' },
        { label: 'tag3', color: '#222' },
        { label: 'tag4', color: '#333' },
      ],
    };
    const { container } = render(<FollowerItem follower={followerWithManyTags} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
