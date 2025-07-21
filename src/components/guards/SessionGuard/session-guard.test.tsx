import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the router
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Mock the authentication hook
vi.mock('@/core/stores', () => ({
  useIsAuthenticated: vi.fn(),
}));

// Import after mocking
import { SessionGuard } from './session-guard';
import { useIsAuthenticated } from '@/core/stores';

const mockUseIsAuthenticated = useIsAuthenticated as ReturnType<typeof vi.fn>;

describe('SessionGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when user is not authenticated', () => {
    mockUseIsAuthenticated.mockReturnValue(false);

    render(
      <SessionGuard>
        <div>Test Content</div>
      </SessionGuard>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should not render children when user is authenticated', () => {
    mockUseIsAuthenticated.mockReturnValue(true);

    render(
      <SessionGuard>
        <div>Test Content</div>
      </SessionGuard>,
    );

    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  it('should redirect to default /feed when user is authenticated', () => {
    mockUseIsAuthenticated.mockReturnValue(true);

    render(
      <SessionGuard>
        <div>Test Content</div>
      </SessionGuard>,
    );

    expect(mockReplace).toHaveBeenCalledWith('/feed');
  });

  it('should redirect to custom path when user is authenticated', () => {
    mockUseIsAuthenticated.mockReturnValue(true);

    render(
      <SessionGuard redirectTo="/dashboard">
        <div>Test Content</div>
      </SessionGuard>,
    );

    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle authentication state changes', () => {
    // Start with not authenticated
    mockUseIsAuthenticated.mockReturnValue(false);

    const { rerender } = render(
      <SessionGuard>
        <div>Test Content</div>
      </SessionGuard>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();

    // Clear the mock calls from the initial render
    vi.clearAllMocks();

    // User becomes authenticated
    mockUseIsAuthenticated.mockReturnValue(true);
    rerender(
      <SessionGuard>
        <div>Test Content</div>
      </SessionGuard>,
    );

    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith('/feed');
  });
});
