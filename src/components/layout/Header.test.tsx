import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the stores
vi.mock('@/core/stores', () => ({
  useIsAuthenticated: vi.fn(),
}));

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Mock AuthController
vi.mock('@/core/controllers', () => ({
  AuthController: {
    logout: vi.fn(),
  },
}));

// Mock Logger
vi.mock('@/libs/logger', () => ({
  Logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocking
import { Header } from './Header';
import { useIsAuthenticated } from '@/core/stores';
import { AuthController } from '@/core/controllers';

const mockUseIsAuthenticated = useIsAuthenticated as ReturnType<typeof vi.fn>;

const mockLogout = AuthController.logout as ReturnType<typeof vi.fn>;

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      mockUseIsAuthenticated.mockReturnValue(false);
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
    beforeEach(() => {
      mockUseIsAuthenticated.mockReturnValue(true);
      mockLogout.mockResolvedValue(undefined);
    });

    it('should show user name and logout button when authenticated', () => {
      render(<Header />);

      // Should show user name
      expect(screen.getByText('User')).toBeInTheDocument();

      // Should show logout button
      expect(screen.getByText('Logout')).toBeInTheDocument();

      // Should not show sign in or get started buttons
      expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
      expect(screen.queryByText('Get started')).not.toBeInTheDocument();
    });

    it('should handle successful logout', async () => {
      render(<Header />);

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      // Should show loading state
      expect(screen.getByText('Logging out...')).toBeInTheDocument();

      // Wait for logout to complete
      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith('/');
      });
    });

    it('should handle logout error gracefully', async () => {
      mockLogout.mockRejectedValue(new Error('Logout failed'));

      render(<Header />);

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      // Wait for logout to complete (should still redirect even on error)
      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith('/');
      });
    });

    it('should prevent double logout clicks', async () => {
      render(<Header />);

      const logoutButton = screen.getByText('Logout');

      // Click multiple times quickly
      fireEvent.click(logoutButton);
      fireEvent.click(logoutButton);
      fireEvent.click(logoutButton);

      // Should only call logout once
      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });
    });

    it('should show user info in mobile menu when authenticated', () => {
      render(<Header />);

      // Open mobile menu
      const mobileMenuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(mobileMenuButton);

      // Should show user name in mobile menu
      const userNames = screen.getAllByText('User');
      expect(userNames).toHaveLength(2); // Desktop + Mobile

      // Should show logout in mobile menu
      const logoutButtons = screen.getAllByText('Logout');
      expect(logoutButtons).toHaveLength(2); // Desktop + Mobile
    });

    it('should handle mobile logout button click', async () => {
      render(<Header />);

      // Open mobile menu
      const mobileMenuButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(mobileMenuButton);

      // Click mobile logout button
      const logoutButtons = screen.getAllByText('Logout');
      fireEvent.click(logoutButtons[1]); // Second one is mobile

      // Wait for logout to complete
      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith('/');
      });
    });
  });
  describe('Mobile Menu', () => {
    beforeEach(() => {
      mockUseIsAuthenticated.mockReturnValue(false);
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
