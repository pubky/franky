import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the stores
vi.mock('@/core/stores', () => ({
  useIsAuthenticated: vi.fn(),
  useCurrentUser: vi.fn(),
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Import after mocking
import { Header } from './Header';
import { useIsAuthenticated, useCurrentUser } from '@/core/stores';

const mockUseIsAuthenticated = useIsAuthenticated as ReturnType<typeof vi.fn>;
const mockUseCurrentUser = useCurrentUser as ReturnType<typeof vi.fn>;

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.log to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      mockUseIsAuthenticated.mockReturnValue(false);
      mockUseCurrentUser.mockReturnValue(null);
    });

    it('should show Sign in and Get started buttons when not authenticated', () => {
      render(<Header />);

      // Desktop buttons
      expect(screen.getByText('Sign in')).toBeInTheDocument();
      expect(screen.getByText('Get started')).toBeInTheDocument();

      // Should not show user info or logout
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    it('should show Sign in and Get started buttons in mobile menu when not authenticated', () => {
      render(<Header />);

      // Open mobile menu
      const mobileMenuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(mobileMenuButton);

      // Mobile buttons should be visible
      const signInButtons = screen.getAllByText('Sign in');
      const getStartedButtons = screen.getAllByText('Get started');

      expect(signInButtons).toHaveLength(2); // Desktop + Mobile
      expect(getStartedButtons).toHaveLength(2); // Desktop + Mobile
    });
  });

  describe('Authenticated User', () => {
    const mockUser = {
      details: {
        id: 'test-user-id',
        name: 'John Doe',
        bio: 'Test bio',
        image: null,
        links: null,
        status: null,
        indexed_at: Date.now(),
      },
      counts: {
        tagged: 0,
        tags: 0,
        unique_tags: 0,
        posts: 0,
        replies: 0,
        following: 0,
        followers: 0,
        friends: 0,
        bookmarks: 0,
      },
      tags: [],
      relationship: {
        following: false,
        followed_by: false,
        muted: false,
      },
    };

    beforeEach(() => {
      mockUseIsAuthenticated.mockReturnValue(true);
      mockUseCurrentUser.mockReturnValue(mockUser);
    });

    it('should show user name and logout button when authenticated', () => {
      render(<Header />);

      // Should show user name
      expect(screen.getByText('John Doe')).toBeInTheDocument();

      // Should show logout button
      expect(screen.getByText('Logout')).toBeInTheDocument();

      // Should not show sign in or get started buttons
      expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
      expect(screen.queryByText('Get started')).not.toBeInTheDocument();
    });

    it('should handle logout button click', () => {
      render(<Header />);

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      // Should log the message (mocked)
      expect(console.log).toHaveBeenCalledWith('Logout clicked - functionality to be implemented');
    });

    it('should show user info in mobile menu when authenticated', () => {
      render(<Header />);

      // Open mobile menu
      const mobileMenuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(mobileMenuButton);

      // Should show user name in mobile menu
      const userNames = screen.getAllByText('John Doe');
      expect(userNames).toHaveLength(2); // Desktop + Mobile

      // Should show logout in mobile menu
      const logoutButtons = screen.getAllByText('Logout');
      expect(logoutButtons).toHaveLength(2); // Desktop + Mobile
    });

    it('should handle mobile logout button click', () => {
      render(<Header />);

      // Open mobile menu
      const mobileMenuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(mobileMenuButton);

      // Click mobile logout button
      const logoutButtons = screen.getAllByText('Logout');
      fireEvent.click(logoutButtons[1]); // Second one is mobile

      // Should log the message (mocked)
      expect(console.log).toHaveBeenCalledWith('Logout clicked - functionality to be implemented');
    });

    it('should show fallback User name when user name is not available', () => {
      const userWithoutName = {
        ...mockUser,
        details: {
          ...mockUser.details,
          name: '',
        },
      };
      mockUseCurrentUser.mockReturnValue(userWithoutName);

      render(<Header />);

      // Should show fallback "User" text
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  describe('Mobile Menu', () => {
    beforeEach(() => {
      mockUseIsAuthenticated.mockReturnValue(false);
      mockUseCurrentUser.mockReturnValue(null);
    });

    it('should toggle mobile menu visibility', () => {
      render(<Header />);

      // Mobile menu should not be visible initially
      expect(screen.queryByText('Documentation')).not.toBeInTheDocument();

      // Open mobile menu
      const mobileMenuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(mobileMenuButton);

      // Mobile menu should be visible
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Help & Support')).toBeInTheDocument();

      // Close mobile menu
      fireEvent.click(mobileMenuButton);

      // Mobile menu should be hidden again
      expect(screen.queryByText('Documentation')).not.toBeInTheDocument();
    });

    it('should close mobile menu when clicking navigation links', () => {
      render(<Header />);

      // Open mobile menu
      const mobileMenuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(mobileMenuButton);

      // Click a navigation link
      const docsLink = screen.getByText('Documentation');
      fireEvent.click(docsLink);

      // Mobile menu should be closed (navigation items should not be visible)
      expect(screen.queryByText('Documentation')).not.toBeInTheDocument();
    });
  });
});
