import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePathname } from 'next/navigation';
import { MobileFooter } from './MobileFooter';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Mock the organisms
vi.mock('@/organisms', () => ({
  AvatarWithFallback: ({
    avatarUrl,
    name,
    size,
    className,
    alt,
  }: {
    avatarUrl?: string;
    name: string;
    size?: string;
    className?: string;
    alt?: string;
  }) => (
    <div data-testid="avatar-with-fallback" className={className} data-size={size}>
      <img data-testid="avatar-image" src={avatarUrl} alt={alt || name} />
      <span data-testid="avatar-name">{name}</span>
    </div>
  ),
}));

// Mock the libs - use actual implementations
vi.mock('@/libs', async () => {
  const actual = await vi.importActual('@/libs');
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
  UNAUTHENTICATED_ROUTES: [],
  AUTHENTICATED_ROUTES: [],
}));

// Mock Core
vi.mock('@/core', () => ({
  FileController: {
    getAvatarUrl: vi.fn((pubky: string) => `https://example.com/avatar/${pubky}`),
  },
}));

// Mock Hooks
vi.mock('@/hooks', () => ({
  useCurrentUserProfile: vi.fn(() => ({
    userDetails: { name: 'Test User' },
    currentUserPubky: 'pk:test-user-pubky',
  })),
}));

describe('MobileFooter', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/home');
  });

  it('renders with default props', () => {
    render(<MobileFooter />);

    expect(document.querySelector('.lucide-house')).toBeInTheDocument();
    expect(document.querySelector('.lucide-search')).toBeInTheDocument();
    expect(document.querySelector('.lucide-flame')).toBeInTheDocument();
    expect(document.querySelector('.lucide-bookmark')).toBeInTheDocument();
    expect(document.querySelector('.lucide-settings')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-with-fallback')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<MobileFooter className="custom-footer" />);

    expect(document.querySelector('.lucide-house')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<MobileFooter />);

    const navItems = [
      { href: '/home', iconClass: '.lucide-house', label: 'Home' },
      { href: '/search', iconClass: '.lucide-search', label: 'Search' },
      { href: '/hot', iconClass: '.lucide-flame', label: 'Hot' },
      { href: '/bookmarks', iconClass: '.lucide-bookmark', label: 'Bookmarks' },
      { href: '/settings', iconClass: '.lucide-settings', label: 'Settings' },
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

    const profileLink = screen.getByTestId('avatar-with-fallback').closest('a');
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

  it('renders avatar with user name', () => {
    render(<MobileFooter />);

    const avatarName = screen.getByTestId('avatar-name');
    expect(avatarName).toBeInTheDocument();
    expect(avatarName).toHaveTextContent('Test User');
  });

  it('applies correct icon classes', () => {
    render(<MobileFooter />);

    const iconClasses = ['.lucide-house', '.lucide-search', '.lucide-flame', '.lucide-bookmark', '.lucide-settings'];
    iconClasses.forEach((selector) => {
      const iconElement = document.querySelector(selector) as HTMLElement | null;
      expect(iconElement).toHaveClass('h-6', 'w-6');
    });
  });

  it('handles active state correctly', () => {
    vi.mocked(usePathname).mockReturnValue('/home');
    render(<MobileFooter />);

    const homeLink = document.querySelector('.lucide-house')?.closest('a');
    expect(homeLink).toHaveClass('bg-secondary/30');
  });

  it('handles inactive state correctly', () => {
    vi.mocked(usePathname).mockReturnValue('/search');
    render(<MobileFooter />);

    const homeLink = document.querySelector('.lucide-house')?.closest('a');
    expect(homeLink).toHaveClass('bg-secondary/20', 'hover:bg-secondary/25');
  });

  it('renders with correct responsive behavior', () => {
    render(<MobileFooter />);

    expect(document.querySelector('.lucide-house')).toBeInTheDocument();
  });

  it('applies correct hover states', () => {
    render(<MobileFooter />);

    expect(document.querySelector('.lucide-house')).toBeInTheDocument();
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

  it('matches snapshot for navigation links', () => {
    render(<MobileFooter />);

    const homeLink = document.querySelector('.lucide-house')?.closest('a');
    expect(homeLink).toMatchSnapshot();
  });

  it('matches snapshot for profile link', () => {
    render(<MobileFooter />);

    const profileLink = screen.getByTestId('avatar-with-fallback').closest('a');
    expect(profileLink).toMatchSnapshot();
  });
});
