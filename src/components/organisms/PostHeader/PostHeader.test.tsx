import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostHeader } from './PostHeader';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Core from '@/core';

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    usePostDetails: vi.fn(),
    useUserDetails: vi.fn(),
    useAvatarUrl: vi.fn(),
  };
});

vi.mock('@/atoms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/atoms')>();
  return {
    ...actual,
    Container: vi.fn(
      ({
        children,
        className,
        overrideDefaults,
      }: {
        children: React.ReactNode;
        className?: string;
        overrideDefaults?: boolean;
      }) => (
        <div data-testid="container" className={className} data-override-defaults={overrideDefaults}>
          {children}
        </div>
      ),
    ),
    Typography: vi.fn(
      ({
        children,
        as,
        size,
        className,
      }: {
        children: React.ReactNode;
        as?: string;
        size?: string;
        className?: string;
      }) => {
        const Tag = (as || 'p') as keyof JSX.IntrinsicElements;
        return (
          <Tag data-testid="typography" data-as={as} data-size={size} className={className}>
            {children}
          </Tag>
        );
      },
    ),
  };
});

vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    AvatarWithFallback: ({ avatarUrl, name, size }: { avatarUrl?: string; name: string; size?: string }) => (
      <div data-testid="avatar" data-size={size}>
        {avatarUrl ? <img data-testid="avatar-image" src={avatarUrl} alt={name} /> : null}
        <div data-testid="avatar-fallback">{name.substring(0, 2).toUpperCase()}</div>
      </div>
    ),
    PostHeaderUserInfo: vi.fn(
      ({
        userId,
        userName,
        characterLimit,
      }: {
        userId: string;
        userName: string;
        characterLimit?: { count: number; max: number };
      }) => (
        <div data-testid="post-header-user-info">
          <div data-testid="avatar" />
          <div>{userName}</div>
          <div>@{userId.substring(0, 8)}</div>
          {characterLimit && (
            <div>
              {characterLimit.count}/{characterLimit.max}
            </div>
          )}
        </div>
      ),
    ),
    PostHeaderTimestamp: vi.fn(({ timeAgo }: { timeAgo: string }) => (
      <div data-testid="post-header-timestamp">
        <svg data-testid="clock-icon" />
        <span>{timeAgo}</span>
      </div>
    )),
  };
});

// Use real libs, only stub cn to a deterministic join (as in Header.test.tsx)
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
    timeAgo: vi.fn(() => '2h'),
    extractInitials: vi.fn(({ name }) => name?.substring(0, 2).toUpperCase() || ''),
    formatPublicKey: vi.fn(({ key, length }) => key?.substring(0, length) || ''),
    Clock: vi.fn(({ className }: { className?: string }) => <svg data-testid="clock-icon" className={className} />),
  };
});

const mockUsePostDetails = vi.mocked(Hooks.usePostDetails);
const mockUseUserDetails = vi.mocked(Hooks.useUserDetails);
const mockUseAvatarUrl = vi.mocked(Hooks.useAvatarUrl);

describe('PostHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading when details are unavailable', () => {
    mockUsePostDetails.mockReturnValue({ postDetails: null, isLoading: false });
    mockUseUserDetails.mockReturnValue({ userDetails: null, isLoading: false });
    mockUseAvatarUrl.mockReturnValue(undefined);

    const { container } = render(<PostHeader postId="user123:post456" />);
    expect(container.firstChild).toHaveTextContent('Loading header...');
  });

  it('renders user name, handle and time', () => {
    const timeSpy = vi.spyOn(Libs, 'timeAgo').mockReturnValue('2h');
    mockUsePostDetails.mockReturnValue({
      postDetails: { indexed_at: '2024-01-01T00:00:00.000Z' } as Core.PostDetailsModelSchema,
      isLoading: false,
    });
    mockUseUserDetails.mockReturnValue({
      userDetails: { id: 'userpubkykey', name: 'Test User', image: 'test-image-id' } as Core.NexusUserDetails,
      isLoading: false,
    });
    mockUseAvatarUrl.mockReturnValue('https://example.com/avatar/userpubkykey.png');

    render(<PostHeader postId="userpubkykey:post456" />);

    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('2h')).toBeInTheDocument();
    timeSpy.mockRestore();
  });

  it('hides time when isReplyInput is true', () => {
    // When isReplyInput is true, postDetails is not fetched
    mockUsePostDetails.mockReturnValue({ postDetails: null, isLoading: false });
    mockUseUserDetails.mockReturnValue({
      userDetails: { id: 'userpubkykey', name: 'Test User', image: 'test-image-id' } as Core.NexusUserDetails,
      isLoading: false,
    });
    mockUseAvatarUrl.mockReturnValue('https://example.com/avatar/userpubkykey.png');

    const { container } = render(<PostHeader postId="userpubkykey:post456" isReplyInput={true} />);

    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    // Verify that time section is not rendered (no Clock icon)
    expect(container.querySelector('[data-testid="clock-icon"]')).not.toBeInTheDocument();
  });

  it('shows loading when user details are not available and isReplyInput is true', () => {
    mockUsePostDetails.mockReturnValue({ postDetails: null, isLoading: false });
    mockUseUserDetails.mockReturnValue({ userDetails: null, isLoading: false });
    mockUseAvatarUrl.mockReturnValue(undefined);

    const { container } = render(<PostHeader postId="userpubkykey:post456" isReplyInput={true} />);

    expect(container.firstChild).toHaveTextContent('Loading header...');
  });
});

describe('PostHeader - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot in loaded state', () => {
    const timeSpy = vi.spyOn(Libs, 'timeAgo').mockReturnValue('2h');
    mockUsePostDetails.mockReturnValue({
      postDetails: { indexed_at: '2024-01-01T00:00:00.000Z' } as Core.PostDetailsModelSchema,
      isLoading: false,
    });
    mockUseUserDetails.mockReturnValue({
      userDetails: {
        id: 'snapshotUserKey',
        name: 'Snapshot User',
        image: 'snapshot-image-id',
      } as Core.NexusUserDetails,
      isLoading: false,
    });
    mockUseAvatarUrl.mockReturnValue('https://example.com/avatar/snapshotUserKey.png');

    const { container } = render(<PostHeader postId="snapshotUserKey:post789" />);
    expect(container.firstChild).toMatchSnapshot();
    timeSpy.mockRestore();
  });

  it('matches snapshot in loading state', () => {
    const timeSpy = vi.spyOn(Libs, 'timeAgo').mockReturnValue('2h');
    mockUsePostDetails.mockReturnValue({ postDetails: null, isLoading: false });
    mockUseUserDetails.mockReturnValue({ userDetails: null, isLoading: false });
    mockUseAvatarUrl.mockReturnValue(undefined);

    const { container } = render(<PostHeader postId="user123:post456" />);
    expect(container.firstChild).toMatchSnapshot();
    timeSpy.mockRestore();
  });
});
