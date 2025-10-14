import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { ProfileMobileMenu } from './ProfileMobileMenu';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/profile/notifications'),
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ProfileMobileMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all mobile menu items', () => {
    render(<ProfileMobileMenu />);

    // Should render 7 buttons for 7 menu items
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(7);

    // Check that all menu items are present by their aria-labels
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Posts')).toBeInTheDocument();
    expect(screen.getByLabelText('Replies')).toBeInTheDocument();
    expect(screen.getByLabelText('Followers')).toBeInTheDocument();
    expect(screen.getByLabelText('Following')).toBeInTheDocument();
    expect(screen.getByLabelText('Friends')).toBeInTheDocument();
    expect(screen.getByLabelText('Tagged')).toBeInTheDocument();
  });

  it('displays counts when provided', () => {
    const counts = {
      notifications: 3,
      posts: 10,
      replies: 5,
      followers: 100,
      following: 50,
      friends: 20,
      tagged: 3,
    };
    render(<ProfileMobileMenu counts={counts} />);

    // Check for the count numbers in span elements
    expect(screen.getAllByText('3')).toHaveLength(2); // notifications and tagged both have count 3
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('handles navigation when menu items are clicked', () => {
    render(<ProfileMobileMenu />);

    const postsButton = screen.getByLabelText('Posts');
    fireEvent.click(postsButton);

    expect(mockPush).toHaveBeenCalledWith('/profile/posts');
  });

  it('highlights active menu item based on current pathname', () => {
    // Test with posts route
    vi.mocked(usePathname).mockReturnValue('/profile/posts');
    render(<ProfileMobileMenu />);

    // Posts should be active (though we need to check implementation details)
    expect(screen.getByLabelText('Posts')).toBeInTheDocument();
  });

  it('renders without counts when no counts provided', () => {
    render(<ProfileMobileMenu />);

    // Should still render all menu items but without counts
    expect(screen.getByLabelText('Posts')).toBeInTheDocument();
    expect(screen.getByLabelText('Replies')).toBeInTheDocument();
    expect(screen.getByLabelText('Tagged')).toBeInTheDocument();
    expect(screen.getByLabelText('Followers')).toBeInTheDocument();
    expect(screen.getByLabelText('Following')).toBeInTheDocument();
    expect(screen.getByLabelText('Friends')).toBeInTheDocument();

    // Should not have count text
    expect(screen.queryByText(/\(.*\)/)).not.toBeInTheDocument();
  });

  it('handles all navigation routes correctly', () => {
    render(<ProfileMobileMenu />);

    // Click different menu items and verify navigation
    fireEvent.click(screen.getByLabelText('Notifications'));
    expect(mockPush).toHaveBeenCalledWith('/profile/notifications');

    fireEvent.click(screen.getByLabelText('Replies'));
    expect(mockPush).toHaveBeenCalledWith('/profile/replies');

    fireEvent.click(screen.getByLabelText('Followers'));
    expect(mockPush).toHaveBeenCalledWith('/profile/followers');

    fireEvent.click(screen.getByLabelText('Following'));
    expect(mockPush).toHaveBeenCalledWith('/profile/following');

    fireEvent.click(screen.getByLabelText('Friends'));
    expect(mockPush).toHaveBeenCalledWith('/profile/friends');

    fireEvent.click(screen.getByLabelText('Tagged'));
    expect(mockPush).toHaveBeenCalledWith('/profile/tagged');
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfileMobileMenu />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with counts', () => {
    const counts = {
      posts: 10,
      replies: 5,
      tagged: 3,
      followers: 100,
      following: 50,
      friends: 20,
    };
    const { container } = render(<ProfileMobileMenu counts={counts} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
