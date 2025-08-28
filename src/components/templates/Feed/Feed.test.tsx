import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Feed } from './Feed';

// Mock the Core module
vi.mock('@/core', () => ({
  AuthController: {
    logout: vi.fn(),
  },
}));

// Mock the atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className, size }: { children: React.ReactNode; className?: string; size?: string }) => (
    <div className={className} data-size={size}>
      {children}
    </div>
  ),
  Heading: ({
    children,
    level,
    size,
    className,
  }: {
    children: React.ReactNode;
    level?: number;
    size?: string;
    className?: string;
  }) => (
    <h1 data-level={level} data-size={size} className={className}>
      {children}
    </h1>
  ),
  Button: ({
    children,
    variant,
    size,
    onClick,
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    onClick?: () => void;
  }) => (
    <button onClick={onClick} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}));

describe('Feed', () => {
  let mockLogout: jest.MockedFunction<() => void>;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Get the mocked AuthController
    const { AuthController } = await import('@/core');
    mockLogout = AuthController.logout as jest.MockedFunction<() => void>;
  });

  it('renders without errors', () => {
    render(<Feed />);
    expect(screen.getByText('Feed')).toBeInTheDocument();
  });

  it('displays the Feed heading correctly', () => {
    render(<Feed />);
    const heading = screen.getByText('Feed');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute('data-level', '1');
    expect(heading).toHaveAttribute('data-size', 'xl');
    expect(heading).toHaveClass('text-2xl');
  });

  it('renders logout button with correct props', () => {
    render(<Feed />);
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveAttribute('data-variant', 'secondary');
    expect(logoutButton).toHaveAttribute('data-size', 'lg');
  });

  it('calls AuthController.logout when logout button is clicked', () => {
    render(<Feed />);
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('renders container structure correctly', () => {
    render(<Feed />);
    const containers = screen.getAllByRole('generic');
    const outerContainer = containers.find(
      (container) => container.getAttribute('data-size') === 'container' && container.classList.contains('px-6'),
    );
    const innerContainer = containers.find((container) => container.getAttribute('data-size') === 'default');

    expect(outerContainer).toBeInTheDocument();
    expect(innerContainer).toBeInTheDocument();
  });
});
