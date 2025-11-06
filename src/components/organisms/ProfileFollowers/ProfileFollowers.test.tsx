import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileFollowers } from './ProfileFollowers';

// Mock Core hooks
vi.mock('@/core', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      currentUserPubky: null,
    };
    return selector(state);
  }),
}));

// Mock libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  };
});

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" data-class-name={className}>
      {children}
    </div>
  ),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" data-class-name={className}>
      {children}
    </div>
  ),
  Heading: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h5 data-testid="heading" data-class-name={className}>
      {children}
    </h5>
  ),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  FollowerItem: ({ follower }: { follower: { id: string; name: string } }) => (
    <div data-testid={`follower-item-${follower.id}`}>{follower.name}</div>
  ),
  ContentNotFound: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <div data-testid="content-not-found" data-class-name={className}>
      {children}
    </div>
  ),
}));

describe('ProfileFollowers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders followers list with cards', () => {
    render(<ProfileFollowers />);

    // Should render follower items (appears in both desktop and mobile views)
    const followerItems = screen.getAllByTestId('follower-item-1');
    expect(followerItems.length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('follower-item-2').length).toBeGreaterThan(0);
  });

  it('applies rounded-md class to desktop card', () => {
    const { container } = render(<ProfileFollowers />);

    const cards = container.querySelectorAll('[data-testid="card"]');
    const desktopCard = Array.from(cards).find((card) => {
      const className = card.getAttribute('data-class-name') || '';
      return className.includes('hidden') && className.includes('lg:block');
    });

    expect(desktopCard).toBeInTheDocument();
    expect(desktopCard?.getAttribute('data-class-name')).toContain('rounded-md');
  });

  it('applies rounded-md class to mobile cards', () => {
    const { container } = render(<ProfileFollowers />);

    const cards = container.querySelectorAll('[data-testid="card"]');
    const mobileCards = Array.from(cards).filter((card) => {
      const className = card.getAttribute('data-class-name') || '';
      return className.includes('p-6') && !className.includes('hidden');
    });

    expect(mobileCards.length).toBeGreaterThan(0);
    mobileCards.forEach((card) => {
      expect(card.getAttribute('data-class-name')).toContain('rounded-md');
    });
  });

  it('renders mobile heading', () => {
    render(<ProfileFollowers />);

    const heading = screen.getByTestId('heading');
    expect(heading).toHaveTextContent('Followers');
    expect(heading?.getAttribute('data-class-name')).toContain('lg:hidden');
  });
});

describe('ProfileFollowers - Snapshots', () => {
  it('matches snapshot with followers', () => {
    const { container } = render(<ProfileFollowers />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
