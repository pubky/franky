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

    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<MobileFooter className="custom-footer" />);
  });

  it('renders all navigation items', () => {
    render(<MobileFooter />);

    const navItems = [
      { href: '/feed', label: 'Feed' },
      { href: '/search', label: 'Search' },
      { href: '/bookmarks', label: 'Bookmarks' },
      { href: '/settings', label: 'Settings' },
    ];

    const links = screen.getAllByRole('link');
    navItems.forEach((item) => {
      const link = links.find((link) => link.getAttribute('href') === item.href);
      expect(link).toHaveAttribute('href', item.href);
    });
  });

  it('renders profile link', () => {
    render(<MobileFooter />);

    const profileLink = screen.getByTestId('avatar').closest('a');
    expect(profileLink).toHaveAttribute('href', '/profile');
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

    expect(document.querySelector('.lucide-user')).toBeInTheDocument();
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
});
