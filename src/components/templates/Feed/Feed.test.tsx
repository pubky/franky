import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Feed } from './Feed';
import { useRouter } from 'next/navigation';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock the components
vi.mock('@/components', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
  Heading: ({ children, level, size, className }: any) => (
    <h1 className={className} data-level={level} data-size={size}>
      {children}
    </h1>
  ),
  Typography: ({ children, size, className }: any) => (
    <p className={className} data-size={size}>
      {children}
    </p>
  ),
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
}));

// Mock the organisms
vi.mock('@/organisms', () => ({
  ContentLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="content-layout">{children}</div>,
}));

// Mock the app routes
vi.mock('@/app', () => ({
  AUTH_ROUTES: {
    LOGOUT: '/logout',
  },
}));

describe('Feed', () => {
  const mockPush = vi.fn();
  const mockRouter = {
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with correct heading and description', () => {
    render(<Feed />);

    expect(screen.getByText('Feed')).toBeInTheDocument();
    expect(
      screen.getByText("Welcome to your feed. This is where you'll see posts from people you follow."),
    ).toBeInTheDocument();
  });

  it('renders placeholder content with correct number of posts', () => {
    render(<Feed />);

    // Should render 5 placeholder posts
    expect(screen.getByText('Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post 2')).toBeInTheDocument();
    expect(screen.getByText('Post 3')).toBeInTheDocument();
    expect(screen.getByText('Post 4')).toBeInTheDocument();
    expect(screen.getByText('Post 5')).toBeInTheDocument();
  });

  it('renders logout button with correct attributes', () => {
    render(<Feed />);

    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveAttribute('id', 'feed-logout-btn');
  });

  it('handles logout button click correctly', () => {
    render(<Feed />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockPush).toHaveBeenCalledWith('/logout');
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('renders within ContentLayout', () => {
    render(<Feed />);

    expect(screen.getByTestId('content-layout')).toBeInTheDocument();
  });

  it('applies correct heading attributes', () => {
    render(<Feed />);

    const heading = screen.getByText('Feed');
    expect(heading).toHaveAttribute('data-level', '1');
    expect(heading).toHaveAttribute('data-size', 'xl');
    expect(heading).toHaveClass('text-2xl');
  });

  it('applies correct typography attributes', () => {
    render(<Feed />);

    const description = screen.getByText(
      "Welcome to your feed. This is where you'll see posts from people you follow.",
    );
    expect(description).toHaveAttribute('data-size', 'md');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('renders placeholder posts with correct content', () => {
    render(<Feed />);

    // Check that each post has the expected content structure
    const post1 = screen.getByText('Post 1').closest('div');
    expect(post1).toHaveClass('p-6');

    // Check for Lorem ipsum content
    expect(screen.getByText(/Lorem ipsum dolor sit amet/)).toBeInTheDocument();
    expect(screen.getByText(/Duis aute irure dolor in reprehenderit/)).toBeInTheDocument();
  });

  it('applies correct styling to content container', () => {
    render(<Feed />);

    const contentContainer = screen.getByText('Post 1').closest('div')?.parentElement;
    expect(contentContainer).toHaveClass('flex', 'flex-col', 'gap-4', 'mt-4');
  });

  it('applies correct styling to logout button', () => {
    render(<Feed />);

    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toHaveClass('mt-6');
  });

  it('renders all placeholder posts with unique keys', () => {
    render(<Feed />);

    // Verify that all 5 posts are rendered
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(`Post ${i}`)).toBeInTheDocument();
    }
  });

  it('handles multiple logout clicks correctly', () => {
    render(<Feed />);

    const logoutButton = screen.getByText('Logout');

    // Click multiple times
    fireEvent.click(logoutButton);
    fireEvent.click(logoutButton);
    fireEvent.click(logoutButton);

    expect(mockPush).toHaveBeenCalledWith('/logout');
    expect(mockPush).toHaveBeenCalledTimes(3);
  });
});

describe('Feed - Snapshots', () => {
  const mockPush = vi.fn();
  const mockRouter = {
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
  });

  it('matches snapshot with default props', () => {
    const { container } = render(<Feed />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for heading structure', () => {
    const { container } = render(<Feed />);
    const heading = screen.getByText('Feed');
    expect(heading).toMatchSnapshot();
  });

  it('matches snapshot for placeholder content', () => {
    const { container } = render(<Feed />);
    const contentContainer = screen.getByText('Post 1').closest('div')?.parentElement;
    expect(contentContainer).toMatchSnapshot();
  });

  it('matches snapshot for logout button', () => {
    const { container } = render(<Feed />);
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toMatchSnapshot();
  });

  it('matches snapshot for individual post', () => {
    const { container } = render(<Feed />);
    const post1 = screen.getByText('Post 1').closest('div');
    expect(post1).toMatchSnapshot();
  });
});
