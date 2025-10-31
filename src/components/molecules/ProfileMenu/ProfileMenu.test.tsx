import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileMenu } from './ProfileMenu';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/profile/posts',
}));

describe('ProfileMenu', () => {
  it('renders profile menu items', () => {
    render(<ProfileMenu />);
    expect(screen.getByText('Posts')).toBeInTheDocument();
    expect(screen.getByText('Replies')).toBeInTheDocument();
    expect(screen.getByText('Tagged')).toBeInTheDocument();
    expect(screen.getByText('Followers')).toBeInTheDocument();
    expect(screen.getByText('Following')).toBeInTheDocument();
    expect(screen.getByText('Friends')).toBeInTheDocument();
  });

  it('displays counts when provided', () => {
    const counts = {
      posts: 10,
      replies: 5,
      tagged: 3,
      followers: 100,
      following: 50,
      friends: 20,
    };
    render(<ProfileMenu counts={counts} />);
    expect(screen.getByText('Posts')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Replies')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Tagged')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
