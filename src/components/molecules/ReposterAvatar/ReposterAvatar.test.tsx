import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReposterAvatar } from './ReposterAvatar';

// Mock hooks
const mockUseUserDetails = vi.fn();
const mockUseAvatarUrl = vi.fn();

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual('@/hooks');
  return {
    ...actual,
    useUserDetails: (userId: string) => mockUseUserDetails(userId),
    useAvatarUrl: (userDetails: unknown) => mockUseAvatarUrl(userDetails),
  };
});

// Mock molecules
vi.mock('@/molecules', () => ({
  AvatarWithFallback: ({
    avatarUrl,
    name,
    size,
    className,
  }: {
    avatarUrl?: string;
    name: string;
    size: string;
    className?: string;
  }) => (
    <div
      data-testid="avatar-with-fallback"
      data-avatar-url={avatarUrl}
      data-name={name}
      data-size={size}
      className={className}
    >
      {name}
    </div>
  ),
}));

// Mock libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  };
});

describe('ReposterAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserDetails.mockReturnValue({
      userDetails: { name: 'Test User', id: 'user-123' },
      isLoading: false,
    });
    mockUseAvatarUrl.mockReturnValue('https://example.com/avatar.jpg');
  });

  it('renders avatar with user details', () => {
    render(<ReposterAvatar reposterId="user-123" index={0} />);

    const avatar = screen.getByTestId('avatar-with-fallback');
    expect(avatar).toHaveAttribute('data-name', 'Test User');
    expect(avatar).toHaveAttribute('data-size', 'sm');
    expect(avatar).toHaveAttribute('data-avatar-url', 'https://example.com/avatar.jpg');
  });

  it('uses reposterId as name fallback when user details are not available', () => {
    mockUseUserDetails.mockReturnValue({
      userDetails: null,
      isLoading: false,
    });

    render(<ReposterAvatar reposterId="user-456" index={0} />);

    const avatar = screen.getByTestId('avatar-with-fallback');
    expect(avatar).toHaveAttribute('data-name', 'user-456');
  });

  it('applies negative margin when index is greater than 0', () => {
    render(<ReposterAvatar reposterId="user-123" index={1} />);

    const avatar = screen.getByTestId('avatar-with-fallback');
    expect(avatar).toHaveClass('-ml-2');
  });

  it('does not apply negative margin when index is 0', () => {
    render(<ReposterAvatar reposterId="user-123" index={0} />);

    const avatar = screen.getByTestId('avatar-with-fallback');
    expect(avatar).not.toHaveClass('-ml-2');
  });

  it('calls useUserDetails with correct reposterId', () => {
    render(<ReposterAvatar reposterId="user-789" index={0} />);

    expect(mockUseUserDetails).toHaveBeenCalledWith('user-789');
  });

  it('calls useAvatarUrl with user details', () => {
    const mockUserDetails = { name: 'Test User', id: 'user-123' };
    mockUseUserDetails.mockReturnValue({
      userDetails: mockUserDetails,
      isLoading: false,
    });

    render(<ReposterAvatar reposterId="user-123" index={0} />);

    expect(mockUseAvatarUrl).toHaveBeenCalledWith(mockUserDetails);
  });

  it('applies correct size class', () => {
    render(<ReposterAvatar reposterId="user-123" index={0} />);

    const avatar = screen.getByTestId('avatar-with-fallback');
    expect(avatar).toHaveClass('size-8', 'shrink-0');
  });
});

describe('ReposterAvatar - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserDetails.mockReturnValue({
      userDetails: { name: 'John Doe', id: 'user-123' },
      isLoading: false,
    });
    mockUseAvatarUrl.mockReturnValue('https://example.com/avatar.jpg');
  });

  it('matches snapshot with user details and avatar URL', () => {
    const { container } = render(<ReposterAvatar reposterId="user-123" index={0} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without user details', () => {
    mockUseUserDetails.mockReturnValue({
      userDetails: null,
      isLoading: false,
    });
    mockUseAvatarUrl.mockReturnValue(undefined);

    const { container } = render(<ReposterAvatar reposterId="user-456" index={0} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with negative margin (index > 0)', () => {
    const { container } = render(<ReposterAvatar reposterId="user-123" index={2} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
