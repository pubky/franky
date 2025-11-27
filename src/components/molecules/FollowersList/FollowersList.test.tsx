import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FollowersList } from './FollowersList';
import type { FollowerData } from '@/hooks/useFollowers';
import * as Core from '@/core';

// Mock FollowerItem
vi.mock('@/molecules/FollowerItem', () => ({
  FollowerItem: ({ follower }: { follower: FollowerData }) => (
    <div data-testid="follower-item" data-id={follower.id}>
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

describe('FollowersList', () => {
  const mockFollowers: FollowerData[] = [
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

  it('renders list of followers', () => {
    render(<FollowersList followers={mockFollowers} />);
    const items = screen.getAllByTestId('follower-item');
    expect(items).toHaveLength(2);
  });

  it('renders empty list when no followers', () => {
    render(<FollowersList followers={[]} />);
    const items = screen.queryAllByTestId('follower-item');
    expect(items).toHaveLength(0);
  });

  it('renders followers in correct order', () => {
    render(<FollowersList followers={mockFollowers} />);
    const items = screen.getAllByTestId('follower-item');
    expect(items[0]).toHaveAttribute('data-id', 'test-user-1');
    expect(items[1]).toHaveAttribute('data-id', 'test-user-2');
  });

  it('renders follower names', () => {
    render(<FollowersList followers={mockFollowers} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
});

describe('FollowersList - Snapshots', () => {
  const mockFollowers: FollowerData[] = [
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

  it('matches snapshot with followers', () => {
    const { container } = render(<FollowersList followers={mockFollowers} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty list', () => {
    const { container } = render(<FollowersList followers={[]} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
