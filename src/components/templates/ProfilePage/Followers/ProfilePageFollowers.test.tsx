import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageFollowers } from './ProfilePageFollowers';
import * as Hooks from '@/hooks';

// Mock useFollowers hook
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useFollowers: vi.fn(() => ({
      followers: [
        {
          id: 'test-user-1' as const,
          name: 'John Doe',
          bio: 'Test bio',
          image: null,
          status: 'active',
          links: null,
          indexed_at: 1704067200000,
          tags: ['bitcoin'],
          stats: {
            tags: 100,
            posts: 50,
          },
        },
      ],
      count: 1,
      isLoading: false,
      onFollow: vi.fn(),
    })),
  };
});

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Heading: ({ children, level, className }: { children: React.ReactNode; level?: number; className?: string }) => {
    const Tag = `h${level || 1}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    return (
      <Tag data-testid={`heading-${level || 1}`} className={className}>
        {children}
      </Tag>
    );
  },
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  FollowersList: ({ followers }: { followers: unknown[] }) => (
    <div data-testid="followers-list">{followers.length} followers</div>
  ),
  FollowersEmpty: () => <div data-testid="followers-empty">No followers yet</div>,
}));

describe('ProfilePageFollowers', () => {
  it('renders without errors', () => {
    render(<ProfilePageFollowers />);
    expect(screen.getByTestId('heading-5')).toBeInTheDocument();
  });

  it('displays the correct heading with count', () => {
    render(<ProfilePageFollowers />);
    const heading = screen.getByTestId('heading-5');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/Followers/);
    expect(heading).toHaveTextContent(/\(1\)/);
  });

  it('displays followers list when followers exist', () => {
    render(<ProfilePageFollowers />);
    expect(screen.getByTestId('followers-list')).toBeInTheDocument();
    expect(screen.getByText('1 followers')).toBeInTheDocument();
  });

  it('shows empty state when no followers', () => {
    vi.mocked(Hooks.useFollowers).mockReturnValueOnce({
      followers: [],
      count: 0,
      isLoading: false,
      onFollow: vi.fn(),
    });
    render(<ProfilePageFollowers />);
    expect(screen.getByTestId('followers-empty')).toBeInTheDocument();
    expect(screen.getByText(/No followers yet/i)).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePageFollowers />);
    expect(container).toMatchSnapshot();
  });
});
