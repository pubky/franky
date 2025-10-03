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
  Button: ({
    children,
    onClick,
    className,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
  Heading: ({
    children,
    level,
    size,
    className,
  }: {
    children: React.ReactNode;
    level?: string;
    size?: string;
    className?: string;
  }) => (
    <h1 className={className} data-level={level} data-size={size}>
      {children}
    </h1>
  ),
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <p className={className} data-size={size}>
      {children}
    </p>
  ),
  Card: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
}));

// Mock the organisms
vi.mock('@/organisms', () => ({
  ContentLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="content-layout">{children}</div>,
  Post: ({ postId, onClick }: { postId: string; onClick?: () => void }) => (
    <div data-testid="post" onClick={onClick}>
      {postId}
    </div>
  ),
}));

// Mock the app routes
vi.mock('@/app', () => ({
  ROOT_ROUTES: '/',
  AUTH_ROUTES: {
    LOGOUT: '/logout',
    SIGN_IN: '/sign-in',
  },
  FEED_ROUTES: {
    FEED: '/feed',
  },
  UNAUTHENTICATED_ROUTES: {
    allowedRoutes: [
      '/',
      '/sign-in',
      '/onboarding/install',
      '/onboarding/scan',
      '/onboarding/pubky',
      '/onboarding/backup',
      '/onboarding/homeserver',
      '/logout',
    ],
    redirectTo: '/',
  },
  AUTHENTICATED_ROUTES: {
    allowedRoutes: ['/onboarding/profile', '/feed', '/post', '/logout'],
    redirectTo: '/feed',
  },
}));

// Mock core posts fetching to resolve with 5 posts
vi.mock('@/core', async (importOriginal) => {
  const actual = (await importOriginal()) as {
    PostController: { fetch: (args?: unknown) => Promise<unknown[]> };
    [key: string]: unknown;
  };
  return {
    ...actual,
    PostController: {
      ...actual.PostController,
      fetch: vi
        .fn()
        .mockResolvedValue([
          { details: { id: 'Post 1' } },
          { details: { id: 'Post 2' } },
          { details: { id: 'Post 3' } },
          { details: { id: 'Post 4' } },
          { details: { id: 'Post 5' } },
        ]),
    },
  };
});

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
    vi.mocked(useRouter).mockReturnValue(mockRouter as ReturnType<typeof useRouter>);
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

  it('renders posts after fetch with correct number of items', async () => {
    render(<Feed />);

    const posts = await screen.findAllByTestId('post');
    expect(posts.length).toBeGreaterThanOrEqual(5);
    expect(screen.getAllByText('Post 1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Post 5').length).toBeGreaterThanOrEqual(1);
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
    expect(heading).toHaveAttribute('data-testid', 'heading-1');
    expect(heading).toHaveClass('text-2xl');
  });

  it('applies correct typography attributes', () => {
    render(<Feed />);

    const description = screen.getByText(
      "Welcome to your feed. This is where you'll see posts from people you follow.",
    );
    expect(description).toHaveAttribute('data-testid', 'typography');
    expect(description).toHaveClass('text-xl');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('renders posts list container after fetch', async () => {
    render(<Feed />);
    await screen.findAllByTestId('post');
    const contentLayout = screen.getByTestId('content-layout');
    expect(contentLayout).toBeInTheDocument();
  });

  it('applies correct styling to content container', async () => {
    render(<Feed />);
    await screen.findAllByTestId('post');
    expect(screen.getByTestId('content-layout')).toBeInTheDocument();
  });

  it('applies correct styling to logout button', () => {
    render(<Feed />);

    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toHaveClass('mt-6');
  });

  it('renders all posts after fetch', async () => {
    render(<Feed />);
    const posts = await screen.findAllByTestId('post');
    expect(posts.length).toBeGreaterThanOrEqual(5);
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
