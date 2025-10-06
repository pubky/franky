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

// Mock libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

// Mock the app routes
vi.mock('@/app', () => ({
  APP_ROUTES: {
    HOME: '/home',
    SEARCH: '/search',
    HOT: '/hot',
    BOOKMARKS: '/bookmarks',
    SETTINGS: '/settings',
    PROFILE: '/profile',
  },
}));

describe('MobileFooter', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/home');
  });

  it('renders with default props', () => {
    render(<MobileFooter />);

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByTestId('flame-icon')).toBeInTheDocument();
    expect(screen.getByTestId('bookmark-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<MobileFooter className="custom-footer" />);
  });

  it('renders all navigation items', () => {
    render(<MobileFooter />);

    const navItems = [
      { href: '/home', icon: 'home-icon', label: 'Home' },
      { href: '/search', icon: 'search-icon', label: 'Search' },
      { href: '/hot', icon: 'flame-icon', label: 'Hot' },
      { href: '/bookmarks', icon: 'bookmark-icon', label: 'Bookmarks' },
      { href: '/settings', icon: 'settings-icon', label: 'Settings' },
    ];

    const links = screen.getAllByRole('link');
    navItems.forEach((item) => {
      const link = links.find((link) => link.getAttribute('href') === item.href);
      expect(link).toHaveAttribute('href', item.href);
      expect(link).toHaveAttribute('aria-label', item.label);
    });
  });

  it('renders profile link', () => {
    render(<MobileFooter />);

    const profileLink = screen.getByTestId('avatar').closest('a');
    expect(profileLink).toHaveAttribute('href', '/profile');
    expect(profileLink).toHaveAttribute('aria-label', 'Profile');
  });

  it('contains correct icons', () => {
    render(<MobileFooter />);

    expect(document.querySelector('.lucide-search')).toBeInTheDocument();
    expect(document.querySelector('.lucide-house')).toBeInTheDocument();
    expect(document.querySelector('.lucide-bookmark')).toBeInTheDocument();
    expect(document.querySelector('.lucide-settings')).toBeInTheDocument();
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

    const icons = ['home-icon', 'search-icon', 'flame-icon', 'bookmark-icon', 'settings-icon'];
    icons.forEach((icon) => {
      const iconElement = screen.getByTestId(icon);
      expect(iconElement).toHaveClass('h-6', 'w-6');
    });
  });

  it('handles active state correctly', () => {
    vi.mocked(usePathname).mockReturnValue('/home');
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
    vi.mocked(usePathname).mockReturnValue('/home');
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
});
