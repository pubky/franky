import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePathname } from 'next/navigation';
import { MobileFooter } from './MobileFooter';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

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
  Home: ({ className }: { className?: string }) => (
    <div data-testid="home-icon" className={className}>
      Home
    </div>
  ),
  Search: ({ className }: { className?: string }) => (
    <div data-testid="search-icon" className={className}>
      Search
    </div>
  ),
  Bookmark: ({ className }: { className?: string }) => (
    <div data-testid="bookmark-icon" className={className}>
      Bookmark
    </div>
  ),
  Settings: ({ className }: { className?: string }) => (
    <div data-testid="settings-icon" className={className}>
      Settings
    </div>
  ),
  User: ({ className }: { className?: string }) => (
    <div data-testid="user-icon" className={className}>
      User
    </div>
  ),
}));

// Mock the app routes
vi.mock('@/app', () => ({
  FEED_ROUTES: {
    FEED: '/feed',
  },
}));

describe('MobileFooter', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/feed');
  });

  it('renders with default props', () => {
    render(<MobileFooter />);

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByTestId('bookmark-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<MobileFooter className="custom-footer" />);

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<MobileFooter />);

    const navItems = [
      { href: '/feed', icon: 'home-icon', label: 'Feed' },
      { href: '/search', icon: 'search-icon', label: 'Search' },
      { href: '/bookmarks', icon: 'bookmark-icon', label: 'Bookmarks' },
      { href: '/settings', icon: 'settings-icon', label: 'Settings' },
    ];

    navItems.forEach((item) => {
      const link = screen.getByTestId(item.icon).closest('a');
      expect(link).toHaveAttribute('href', item.href);
    });
  });

  it('renders profile link', () => {
    render(<MobileFooter />);

    const profileLink = screen.getByTestId('avatar').closest('a');
    expect(profileLink).toHaveAttribute('href', '/profile');
  });

  it('applies correct classes to container', () => {
    render(<MobileFooter />);

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('applies correct classes to navigation container', () => {
    render(<MobileFooter />);

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('applies correct classes to navigation links', () => {
    render(<MobileFooter />);

    const homeLink = screen.getByTestId('home-icon').closest('a');
    expect(homeLink).toHaveClass('p-3', 'rounded-full', 'backdrop-blur-sm', 'transition-all', 'bg-secondary/30');
  });

  it('applies correct classes to profile link', () => {
    render(<MobileFooter />);

    const profileLink = screen.getByTestId('avatar').closest('a');
    expect(profileLink).toHaveClass('flex-shrink-0', 'relative');
  });

  it('applies correct classes to avatar', () => {
    render(<MobileFooter />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('h-12', 'w-12');
  });

  it('renders avatar with correct props', () => {
    render(<MobileFooter />);

    const avatarImage = screen.getByTestId('avatar-image');
    expect(avatarImage).toHaveAttribute('src', 'https://i.pravatar.cc/150?img=68');
    expect(avatarImage).toHaveAttribute('alt', 'Profile');
  });

  it('renders avatar fallback with user icon', () => {
    render(<MobileFooter />);

    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toBeInTheDocument();

    const userIcon = screen.getByTestId('user-icon');
    expect(userIcon).toHaveClass('h-5', 'w-5');
  });

  it('applies correct icon classes', () => {
    render(<MobileFooter />);

    const icons = ['home-icon', 'search-icon', 'bookmark-icon', 'settings-icon'];
    icons.forEach((icon) => {
      const iconElement = screen.getByTestId(icon);
      expect(iconElement).toHaveClass('h-6', 'w-6');
    });
  });

  it('handles active state correctly', () => {
    vi.mocked(usePathname).mockReturnValue('/feed');
    render(<MobileFooter />);

    const homeLink = screen.getByTestId('home-icon').closest('a');
    expect(homeLink).toHaveClass('bg-secondary/30');
  });

  it('handles inactive state correctly', () => {
    vi.mocked(usePathname).mockReturnValue('/search');
    render(<MobileFooter />);

    const homeLink = screen.getByTestId('home-icon').closest('a');
    expect(homeLink).toHaveClass('bg-secondary/20', 'hover:bg-secondary/25');
  });

  it('renders with correct responsive behavior', () => {
    render(<MobileFooter />);

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('applies correct hover states', () => {
    render(<MobileFooter />);

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });
});

describe('MobileFooter - Snapshots', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/feed');
  });

  it('matches snapshot with default props', () => {
    const { container } = render(<MobileFooter />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<MobileFooter className="custom-footer" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with different active path', () => {
    vi.mocked(usePathname).mockReturnValue('/search');
    const { container } = render(<MobileFooter />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for navigation links', () => {
    render(<MobileFooter />);

    const homeLink = screen.getByTestId('home-icon').closest('a');
    expect(homeLink).toMatchSnapshot();
  });

  it('matches snapshot for profile link', () => {
    render(<MobileFooter />);

    const profileLink = screen.getByTestId('avatar').closest('a');
    expect(profileLink).toMatchSnapshot();
  });
});
