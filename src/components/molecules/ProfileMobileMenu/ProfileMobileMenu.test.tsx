import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileMobileMenu } from './ProfileMobileMenu';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/profile/posts',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('ProfileMobileMenu', () => {
  it('renders mobile menu items', () => {
    render(<ProfileMobileMenu />);
    // Should render 6 buttons for 6 menu items
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(6);
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
    render(<ProfileMobileMenu counts={counts} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

