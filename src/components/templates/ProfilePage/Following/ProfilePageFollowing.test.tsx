import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageFollowing } from './ProfilePageFollowing';
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
          name: 'Satoshi Nakamoto',
          bio: 'Bitcoin creator',
          image: null,
          status: 'active',
          links: null,
          indexed_at: 1704067200000,
          tags: ['bitcoin', 'og'],
          stats: {
            tags: 1200,
            posts: 1,
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
  UserConnectionsEmpty: ({
    title,
    description,
    showActionButtons,
  }: {
    title: string;
    description: React.ReactNode;
    showActionButtons?: boolean;
  }) => (
    <div data-testid="connections-empty">
      <div>{title}</div>
      {description}
      {showActionButtons && <div data-testid="action-buttons">Action buttons</div>}
    </div>
  ),
}));

describe('ProfilePageFollowing', () => {
  it('renders without errors', () => {
    render(<ProfilePageFollowing />);
    expect(screen.getByTestId('heading-5')).toBeInTheDocument();
  });

  it('displays the correct heading with count', () => {
    render(<ProfilePageFollowing />);
    const heading = screen.getByTestId('heading-5');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/Following/);
    expect(heading).toHaveTextContent(/\(1\)/);
  });

  it('displays connections list when connections exist', () => {
    render(<ProfilePageFollowing />);
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
    render(<ProfilePageFollowing />);
    expect(screen.getByTestId('connections-empty')).toBeInTheDocument();
    expect(screen.getByText(/You are the algorithm/i)).toBeInTheDocument();
    expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
  });

  it('calls useProfileConnections with FOLLOWING type', () => {
    render(<ProfilePageFollowing />);
    expect(Hooks.useProfileConnections).toHaveBeenCalledWith(Hooks.CONNECTION_TYPE.FOLLOWING);
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePageFollowing />);
    expect(container).toMatchSnapshot();
  });
});
