import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostHeader } from './PostHeader';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

vi.mock('@/atoms', () => ({
  Avatar: vi.fn(({ children }) => <div data-testid="avatar">{children}</div>),
  AvatarImage: vi.fn(() => <img data-testid="avatar-image" alt="" />),
  AvatarFallback: vi.fn(({ children }) => <div data-testid="avatar-fallback">{children}</div>),
}));

vi.mock('@/core', () => ({
  filesApi: {
    getAvatar: vi.fn(() => 'https://example.com/avatar.png'),
  },
  PostController: {
    read: vi.fn(),
  },
  ProfileController: {
    read: vi.fn(),
  },
}));

// Use real libs, only stub cn to a deterministic join (as in Header.test.tsx)
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  };
});

const mockUseLiveQuery = vi.mocked(useLiveQuery);

describe('PostHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading when details are unavailable', () => {
    // First call (postDetails) returns null, second (userDetails) returns null
    mockUseLiveQuery
      .mockReturnValueOnce(null as unknown as Awaited<ReturnType<typeof Core.PostController.read>>)
      .mockReturnValueOnce(null as unknown as Awaited<ReturnType<typeof Core.ProfileController.read>>);

    const { container } = render(<PostHeader postId="user123:post456" />);
    expect(container.firstChild).toHaveTextContent('Loading header...');
  });

  it('renders user name, handle and time', () => {
    const timeSpy = vi.spyOn(Libs, 'timeAgo').mockReturnValue('2h');
    mockUseLiveQuery
      .mockReturnValueOnce({ indexed_at: '2024-01-01T00:00:00.000Z' })
      .mockReturnValueOnce({ name: 'Test User' });

    render(<PostHeader postId="userpubkykey:post456" />);

    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('2h')).toBeInTheDocument();
    timeSpy.mockRestore();
  });

  it('hides time when hideTime is true', () => {
    // When hideTime is true, postDetails query returns null immediately, then userDetails query returns user data
    mockUseLiveQuery
      .mockReturnValueOnce(null) // postDetails query (returns null when hideTime is true)
      .mockReturnValueOnce({ name: 'Test User' }); // userDetails query

    const { container } = render(<PostHeader postId="userpubkykey:post456" hideTime={true} />);

    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    // Verify that time section is not rendered (no Clock icon)
    expect(container.querySelector('[data-testid="clock-icon"]')).not.toBeInTheDocument();
  });

  it('shows fallback User when user details are not available and hideTime is true', () => {
    // When hideTime is true and userDetails is null, should show fallback "User"
    mockUseLiveQuery.mockReturnValueOnce(null);

    render(<PostHeader postId="userpubkykey:post456" hideTime={true} />);

    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });
});

describe('PostHeader - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot in loaded state', () => {
    const timeSpy = vi.spyOn(Libs, 'timeAgo').mockReturnValue('2h');
    mockUseLiveQuery
      .mockReturnValueOnce({ indexed_at: '2024-01-01T00:00:00.000Z' })
      .mockReturnValueOnce({ name: 'Snapshot User' });

    const { container } = render(<PostHeader postId="snapshotUserKey:post789" />);
    expect(container.firstChild).toMatchSnapshot();
    timeSpy.mockRestore();
  });

  it('matches snapshot in loading state', () => {
    const timeSpy = vi.spyOn(Libs, 'timeAgo').mockReturnValue('2h');
    mockUseLiveQuery
      .mockReturnValueOnce(null as unknown as Awaited<ReturnType<typeof Core.PostController.read>>)
      .mockReturnValueOnce(null as unknown as Awaited<ReturnType<typeof Core.ProfileController.read>>);

    const { container } = render(<PostHeader postId="user123:post456" />);
    expect(container.firstChild).toMatchSnapshot();
    timeSpy.mockRestore();
  });
});
