import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserConnectionsList } from './UserConnectionsList';
import type { UserConnectionData } from '@/hooks/useProfileConnections';
import * as Core from '@/core';

// Mock FollowerItem
vi.mock('@/molecules/FollowerItem', () => ({
  FollowerItem: ({ follower }: { follower: UserConnectionData }) => (
    <div data-testid="connection-item" data-id={follower.id}>
      {follower.name}
    </div>
  ),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

describe('UserConnectionsList', () => {
  const mockConnections: UserConnectionData[] = [
    {
      id: 'test-user-1' as Core.Pubky,
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
    {
      id: 'test-user-2' as Core.Pubky,
      name: 'Jane Smith',
      bio: 'Another bio',
      image: null,
      status: 'active',
      links: null,
      indexed_at: 1704067200000,
      tags: ['candid'],
      stats: {
        tags: 200,
        posts: 75,
      },
    },
  ];

  it('renders list of connections', () => {
    render(<UserConnectionsList connections={mockConnections} />);
    const items = screen.getAllByTestId('connection-item');
    expect(items).toHaveLength(2);
  });

  it('renders empty list when no connections', () => {
    render(<UserConnectionsList connections={[]} />);
    const items = screen.queryAllByTestId('connection-item');
    expect(items).toHaveLength(0);
  });

  it('renders connections in correct order', () => {
    render(<UserConnectionsList connections={mockConnections} />);
    const items = screen.getAllByTestId('connection-item');
    expect(items[0]).toHaveAttribute('data-id', 'test-user-1');
    expect(items[1]).toHaveAttribute('data-id', 'test-user-2');
  });

  it('renders connection names', () => {
    render(<UserConnectionsList connections={mockConnections} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
});

describe('UserConnectionsList - Snapshots', () => {
  const mockConnections: UserConnectionData[] = [
    {
      id: 'test-user-1' as Core.Pubky,
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
    {
      id: 'test-user-2' as Core.Pubky,
      name: 'Jane Smith',
      bio: 'Another bio',
      image: null,
      status: 'active',
      links: null,
      indexed_at: 1704067200000,
      tags: ['candid'],
      stats: {
        tags: 200,
        posts: 75,
      },
    },
  ];

  it('matches snapshot with connections', () => {
    const { container } = render(<UserConnectionsList connections={mockConnections} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty list', () => {
    const { container } = render(<UserConnectionsList connections={[]} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
