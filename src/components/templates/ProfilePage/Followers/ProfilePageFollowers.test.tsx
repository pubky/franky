import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageFollowers } from './ProfilePageFollowers';
import * as Hooks from '@/hooks';

// Mock useProfileConnections hook
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useProfileConnections: vi.fn(() => ({
      connections: [
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
  Typography: ({ children, as, className }: { children: React.ReactNode; as?: string; className?: string }) => {
    const Tag = as || 'p';
    return (
      <Tag data-testid="typography" className={className}>
        {children}
      </Tag>
    );
  },
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  UserConnectionsList: ({ connections }: { connections: unknown[] }) => (
    <div data-testid="connections-list">{connections.length} connections</div>
  ),
  FollowersEmpty: () => (
    <div data-testid="connections-empty">
      <div>Looking for followers?</div>
    </div>
  ),
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

  it('displays connections list when connections exist', () => {
    render(<ProfilePageFollowers />);
    expect(screen.getByTestId('connections-list')).toBeInTheDocument();
    expect(screen.getByText('1 connections')).toBeInTheDocument();
  });

  it('shows empty state when no connections', () => {
    vi.mocked(Hooks.useProfileConnections).mockReturnValueOnce({
      connections: [],
      count: 0,
      isLoading: false,
      onFollow: vi.fn(),
    });
    render(<ProfilePageFollowers />);
    expect(screen.getByTestId('connections-empty')).toBeInTheDocument();
    expect(screen.getByText(/Looking for followers?/i)).toBeInTheDocument();
  });

  it('calls useProfileConnections with FOLLOWERS type', () => {
    render(<ProfilePageFollowers />);
    expect(Hooks.useProfileConnections).toHaveBeenCalledWith(Hooks.CONNECTION_TYPE.FOLLOWERS);
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePageFollowers />);
    expect(container).toMatchSnapshot();
  });
});
