import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActiveUsers } from './ActiveUsers';

// Mock the atoms
vi.mock('@/atoms', () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => <img data-testid="avatar-image" src={src} alt={alt} />,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <div data-testid="avatar-fallback">{children}</div>,
}));

// Mock the libs
vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  Users: ({ className }: { className?: string }) => (
    <div data-testid="users-icon" className={className}>
      Users
    </div>
  ),
}));

describe('ActiveUsers', () => {
  it('renders with default props', () => {
    render(<ActiveUsers />);

    expect(screen.getByTestId('active-users')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<ActiveUsers className="custom-class" />);

    const container = screen.getByTestId('active-users');
    expect(container).toHaveClass('custom-class');
  });

  it('renders all user data correctly', () => {
    render(<ActiveUsers />);

    // Check that all users are rendered
    expect(screen.getByText('David')).toBeInTheDocument();
    expect(screen.getByText('Emma')).toBeInTheDocument();
    expect(screen.getByText('Frank')).toBeInTheDocument();

    // Check user stats
    expect(screen.getByText('42 posts • 12 tags')).toBeInTheDocument();
    expect(screen.getByText('38 posts • 8 tags')).toBeInTheDocument();
    expect(screen.getByText('35 posts • 15 tags')).toBeInTheDocument();
  });

  it('renders user avatars with correct props', () => {
    render(<ActiveUsers />);

    const avatars = screen.getAllByTestId('avatar');
    expect(avatars).toHaveLength(3);

    const avatarImages = screen.getAllByTestId('avatar-image');
    expect(avatarImages).toHaveLength(3);

    // Check avatar sources
    expect(avatarImages[0]).toHaveAttribute('src', 'https://i.pravatar.cc/150?img=33');
    expect(avatarImages[1]).toHaveAttribute('src', 'https://i.pravatar.cc/150?img=9');
    expect(avatarImages[2]).toHaveAttribute('src', 'https://i.pravatar.cc/150?img=13');

    // Check avatar alt texts
    expect(avatarImages[0]).toHaveAttribute('alt', 'David');
    expect(avatarImages[1]).toHaveAttribute('alt', 'Emma');
    expect(avatarImages[2]).toHaveAttribute('alt', 'Frank');
  });

  it('renders avatar fallbacks with correct initials', () => {
    render(<ActiveUsers />);

    const fallbacks = screen.getAllByTestId('avatar-fallback');
    expect(fallbacks).toHaveLength(3);

    expect(fallbacks[0]).toHaveTextContent('D');
    expect(fallbacks[1]).toHaveTextContent('E');
    expect(fallbacks[2]).toHaveTextContent('F');
  });

  it('renders See All button with correct styling', () => {
    render(<ActiveUsers />);

    const seeAllButton = screen.getByText('See All');
    expect(seeAllButton).toBeInTheDocument();
    expect(seeAllButton.closest('button')).toHaveClass(
      'flex',
      'items-center',
      'gap-2',
      'py-2',
      'px-4',
      'rounded-full',
      'border',
      'border-border',
      'hover:bg-secondary/10',
      'transition-colors',
    );
  });

  it('renders See All button with correct icon', () => {
    render(<ActiveUsers />);

    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByText('See All')).toBeInTheDocument();
  });

  it('applies correct container classes', () => {
    render(<ActiveUsers />);

    const container = screen.getByTestId('active-users');
    expect(container).toHaveClass('flex', 'flex-col', 'gap-4');
  });

  it('applies correct heading classes', () => {
    render(<ActiveUsers />);

    const heading = screen.getByText('Active Users');
    expect(heading).toHaveClass('text-2xl', 'font-light', 'text-muted-foreground');
  });

  it('applies correct user item classes', () => {
    render(<ActiveUsers />);

    const userItems = screen.getAllByText(/posts • \d+ tags/);
    expect(userItems).toHaveLength(3);

    userItems.forEach((item) => {
      const userContainer = item.closest('div');
      expect(userContainer).toHaveClass('flex', 'items-center', 'gap-3');
    });
  });

  it('applies correct avatar classes', () => {
    render(<ActiveUsers />);

    const avatars = screen.getAllByTestId('avatar');
    avatars.forEach((avatar) => {
      expect(avatar).toHaveClass('h-12', 'w-12');
    });
  });

  it('applies correct user info classes', () => {
    render(<ActiveUsers />);

    const userNames = screen.getAllByText(/David|Emma|Frank/);
    userNames.forEach((name) => {
      expect(name).toHaveClass('text-base', 'font-bold', 'text-foreground');
    });

    const userStats = screen.getAllByText(/posts • \d+ tags/);
    userStats.forEach((stat) => {
      expect(stat).toHaveClass('text-sm', 'text-muted-foreground', 'opacity-50');
    });
  });

  it('handles button hover states correctly', () => {
    render(<ActiveUsers />);

    const seeAllButton = screen.getByText('See All').closest('button');
    expect(seeAllButton).toHaveClass('hover:bg-secondary/10', 'transition-colors');
  });

  it('renders with correct data structure', () => {
    render(<ActiveUsers />);

    // Verify the structure matches the expected mock data
    const users = [
      { name: 'David', posts: 42, tags: 12 },
      { name: 'Emma', posts: 38, tags: 8 },
      { name: 'Frank', posts: 35, tags: 15 },
    ];

    users.forEach((user) => {
      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(`${user.posts} posts • ${user.tags} tags`)).toBeInTheDocument();
    });
  });
});

describe('ActiveUsers - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<ActiveUsers />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<ActiveUsers className="custom-active-users" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for individual user items', () => {
    render(<ActiveUsers />);

    const userItems = screen.getAllByText(/David|Emma|Frank/);
    userItems.forEach((item) => {
      const userContainer = item.closest('div');
      expect(userContainer).toMatchSnapshot();
    });
  });

  it('matches snapshot for See All button', () => {
    render(<ActiveUsers />);

    const seeAllButton = screen.getByText('See All').closest('button');
    expect(seeAllButton).toMatchSnapshot();
  });
});
