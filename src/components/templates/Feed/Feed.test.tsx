import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Feed } from './Feed';
import { useRouter } from 'next/navigation';
import * as Core from '@/core';

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
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="container">
      {children}
    </div>
  ),
}));

// Mock the organisms
vi.mock('@/organisms', () => ({
  Post: ({ postId, clickable, onClick }: { postId: string; clickable?: boolean; onClick?: () => void }) => (
    <div data-testid="post" data-post-id={postId} onClick={onClick} data-clickable={clickable}>
      Post: {postId}
    </div>
  ),
}));

// Mock the core
vi.mock('@/core', () => ({
  PostController: {
    fetch: vi.fn(),
  },
}));

// Mock the hooks
vi.mock('@/hooks', () => ({
  useInfiniteScroll: vi.fn(() => ({ sentinelRef: { current: null } })),
}));

// Mock the app routes
vi.mock('@/app', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    AUTH_ROUTES: {
      LOGOUT: '/logout',
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
    vi.mocked(Core.PostController.fetch).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders with correct heading', async () => {
    render(<Feed />);

    expect(screen.getByText('Feed')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<Feed />);

    expect(screen.getByText('Loading posts...')).toBeInTheDocument();
  });

  it('renders posts when data is loaded', async () => {
    const mockPosts = [
      {
        details: { id: 'user1:post1' },
      },
      {
        details: { id: 'user2:post2' },
      },
    ];
    vi.mocked(Core.PostController.fetch).mockResolvedValue(mockPosts);

    render(<Feed />);

    await waitFor(() => {
      const posts = screen.queryAllByTestId('post');
      expect(posts.length).toBe(2);
    });

    const posts = screen.getAllByTestId('post');
    expect(posts).toHaveLength(2);
  });

  it('shows no posts message when no posts are available', async () => {
    vi.mocked(Core.PostController.fetch).mockResolvedValue([]);

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText('No posts found')).toBeInTheDocument();
    });
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

  it('fetches posts on mount', async () => {
    render(<Feed />);

    await waitFor(() => {
      expect(Core.PostController.fetch).toHaveBeenCalledWith({ limit: 20, offset: 0 });
    });
  });

  it('handles post click and navigates to post page', async () => {
    const mockPosts = [
      {
        details: { id: 'user1:post1' },
      },
    ];
    vi.mocked(Core.PostController.fetch).mockResolvedValue(mockPosts);

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByTestId('post')).toBeInTheDocument();
    });

    const post = screen.getByTestId('post');
    fireEvent.click(post);

    expect(mockPush).toHaveBeenCalledWith('/post/user1/post1');
  });

  it('shows error message when fetch fails', async () => {
    vi.mocked(Core.PostController.fetch).mockRejectedValue(new Error('Failed to fetch'));

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
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
    vi.mocked(useRouter).mockReturnValue(mockRouter as ReturnType<typeof useRouter>);
    vi.mocked(Core.PostController.fetch).mockResolvedValue([]);
  });

  it('matches snapshot with default props', () => {
    const { container } = render(<Feed />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for heading structure', () => {
    render(<Feed />);
    const heading = screen.getByText('Feed');
    expect(heading).toMatchSnapshot();
  });

  it('matches snapshot for logout button', () => {
    render(<Feed />);
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toMatchSnapshot();
  });
});
