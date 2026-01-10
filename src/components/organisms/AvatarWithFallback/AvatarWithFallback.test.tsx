import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AvatarWithFallback } from './AvatarWithFallback';

// Mock dexie-react-hooks
const mockUseLiveQuery = vi.fn();
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (...args: unknown[]) => mockUseLiveQuery(...args),
}));

// Mock Core
const mockGetModerationStatus = vi.fn();
const mockUnblur = vi.fn();
vi.mock('@/core', () => ({
  ModerationController: {
    getModerationStatus: (...args: unknown[]) => mockGetModerationStatus(...args),
    unblur: (...args: unknown[]) => mockUnblur(...args),
  },
  ModerationType: {
    PROFILE: 'PROFILE',
  },
}));

// Mock Config
vi.mock('@/config', () => ({
  CDN_URL: 'https://cdn.example.com',
}));

// Mock Atoms components
vi.mock('@/atoms', () => ({
  Avatar: ({
    children,
    className,
    'data-testid': dataTestId,
  }: {
    children: React.ReactNode;
    className?: string;
    'data-testid'?: string;
  }) => (
    <div data-testid={dataTestId || 'avatar'} className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({
    src,
    alt,
    onError,
    className,
  }: {
    src: string;
    alt: string;
    onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    className?: string;
  }) => <img data-testid="avatar-image" src={src} alt={alt} onError={onError} className={className} />,
  AvatarFallback: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar-fallback" className={className}>
      {children}
    </div>
  ),
  Button: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
  }) => (
    <button data-testid="unblur-button" onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

// Mock libs - use real extractInitials and cn
vi.mock('@/libs', async () => {
  const actual = await vi.importActual('@/libs');
  return {
    ...actual,
    EyeOff: ({ className }: { className?: string }) => <span data-testid="eye-off-icon" className={className} />,
  };
});

describe('AvatarWithFallback', () => {
  const mockProps = {
    name: 'John Doe',
  };

  const validAvatarUrl = 'https://cdn.example.com/avatar/6mfxozzqmb36rc9rgy3rykoyfghfao74n8igt5tf1boehproahoy';
  const validUserId = '6mfxozzqmb36rc9rgy3rykoyfghfao74n8igt5tf1boehproahoy';

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: moderation status loaded, not blurred
    mockUseLiveQuery.mockReturnValue({ is_blurred: false });
  });

  it('renders avatar image when avatarUrl is provided and moderation status is loaded', () => {
    render(<AvatarWithFallback {...mockProps} avatarUrl={validAvatarUrl} />);

    const avatarImage = screen.getByTestId('avatar-image');
    expect(avatarImage).toHaveAttribute('src', validAvatarUrl);
    expect(avatarImage).toHaveAttribute('alt', 'John Doe');
  });

  it('renders avatar fallback when avatarUrl is not provided', () => {
    render(<AvatarWithFallback {...mockProps} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
  });

  it('renders avatar fallback while moderation status is loading', () => {
    mockUseLiveQuery.mockReturnValue(undefined);

    render(<AvatarWithFallback {...mockProps} avatarUrl={validAvatarUrl} />);

    expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument();
    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
  });

  it('uses custom alt text when provided', () => {
    render(<AvatarWithFallback {...mockProps} avatarUrl={validAvatarUrl} alt="Custom alt text" />);

    const avatarImage = screen.getByTestId('avatar-image');
    expect(avatarImage).toHaveAttribute('alt', 'Custom alt text');
  });

  it('uses name as alt text when alt is not provided', () => {
    render(<AvatarWithFallback {...mockProps} avatarUrl={validAvatarUrl} />);

    const avatarImage = screen.getByTestId('avatar-image');
    expect(avatarImage).toHaveAttribute('alt', 'John Doe');
  });

  it('applies className to avatar', () => {
    render(<AvatarWithFallback {...mockProps} className="custom-class" data-testid="test-avatar" />);

    const avatar = screen.getByTestId('test-avatar');
    expect(avatar).toHaveClass('custom-class');
  });

  it('applies fallbackClassName to fallback', () => {
    render(<AvatarWithFallback {...mockProps} fallbackClassName="fallback-class" />);

    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveClass('fallback-class');
  });

  it('uses extractInitials for fallback when no avatarUrl', () => {
    render(<AvatarWithFallback {...mockProps} name="Alice Bob" />);

    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('renders with both className and fallbackClassName', () => {
    render(
      <AvatarWithFallback
        {...mockProps}
        className="avatar-class"
        fallbackClassName="fallback-class"
        data-testid="test-avatar"
      />,
    );

    const avatar = screen.getByTestId('test-avatar');
    const fallback = screen.getByTestId('avatar-fallback');

    expect(avatar).toHaveClass('avatar-class');
    expect(fallback).toHaveClass('fallback-class');
  });

  it('passes data-testid to avatar component', () => {
    render(<AvatarWithFallback {...mockProps} data-testid="custom-avatar-testid" />);

    expect(screen.getByTestId('custom-avatar-testid')).toBeInTheDocument();
  });

  describe('Image Error Handling', () => {
    it('falls back to initials when image fails to load', () => {
      render(<AvatarWithFallback {...mockProps} avatarUrl={validAvatarUrl} />);

      // Initially should show the image
      const avatarImage = screen.getByTestId('avatar-image');
      expect(avatarImage).toBeInTheDocument();

      // Simulate image load error
      fireEvent.error(avatarImage);

      // Should now show fallback with initials
      expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('handles error with custom fallbackClassName', () => {
      render(<AvatarWithFallback {...mockProps} avatarUrl={validAvatarUrl} fallbackClassName="error-fallback" />);

      const avatarImage = screen.getByTestId('avatar-image');
      fireEvent.error(avatarImage);

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveClass('error-fallback');
    });

    it('uses extractInitials correctly after image error', () => {
      render(<AvatarWithFallback name="Alice Bob Charlie" avatarUrl={validAvatarUrl} />);

      const avatarImage = screen.getByTestId('avatar-image');
      fireEvent.error(avatarImage);

      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('does not show image when avatarUrl is empty string', () => {
      render(<AvatarWithFallback {...mockProps} avatarUrl="" />);

      expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    });

    it('maintains error state after rerender', () => {
      const { rerender } = render(<AvatarWithFallback {...mockProps} avatarUrl={validAvatarUrl} />);

      const avatarImage = screen.getByTestId('avatar-image');
      fireEvent.error(avatarImage);

      // Rerender with same props
      rerender(<AvatarWithFallback {...mockProps} avatarUrl={validAvatarUrl} />);

      // Should still show fallback
      expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    });

    it('resets error state when avatarUrl changes', () => {
      const newAvatarUrl = 'https://cdn.example.com/avatar/7nfxozzqmb36rc9rgy3rykoyfghfao74n8igt5tf1boehproahoy';
      const { rerender } = render(<AvatarWithFallback {...mockProps} avatarUrl={validAvatarUrl} />);

      const firstImage = screen.getByTestId('avatar-image');
      fireEvent.error(firstImage);

      // Should show fallback
      expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();

      // Rerender with new avatarUrl
      rerender(<AvatarWithFallback {...mockProps} avatarUrl={newAvatarUrl} />);

      // Should try new image
      expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
      expect(screen.queryByTestId('avatar-fallback')).not.toBeInTheDocument();
    });
  });

  describe('Moderation Functionality', () => {
    it('applies blur class when moderation status is blurred', () => {
      mockUseLiveQuery.mockReturnValue({ is_blurred: true });

      render(<AvatarWithFallback {...mockProps} avatarUrl={validAvatarUrl} />);

      const avatarImage = screen.getByTestId('avatar-image');
      expect(avatarImage).toHaveClass('blur-xs');
    });

    it('does not apply blur class when moderation status is not blurred', () => {
      mockUseLiveQuery.mockReturnValue({ is_blurred: false });

      render(<AvatarWithFallback {...mockProps} avatarUrl={validAvatarUrl} />);

      const avatarImage = screen.getByTestId('avatar-image');
      expect(avatarImage).not.toHaveClass('blur-xs');
    });

    it('shows unblur button when image is blurred', () => {
      mockUseLiveQuery.mockReturnValue({ is_blurred: true });

      render(<AvatarWithFallback {...mockProps} avatarUrl={validAvatarUrl} />);

      expect(screen.getByTestId('unblur-button')).toBeInTheDocument();
      expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();
    });

    it('does not show unblur button when image is not blurred', () => {
      mockUseLiveQuery.mockReturnValue({ is_blurred: false });

      render(<AvatarWithFallback {...mockProps} avatarUrl={validAvatarUrl} />);

      expect(screen.queryByTestId('unblur-button')).not.toBeInTheDocument();
    });

    it('calls ModerationController.unblur when unblur button is clicked', () => {
      mockUseLiveQuery.mockReturnValue({ is_blurred: true });

      render(<AvatarWithFallback {...mockProps} avatarUrl={validAvatarUrl} />);

      const unblurButton = screen.getByTestId('unblur-button');
      fireEvent.click(unblurButton);

      expect(mockUnblur).toHaveBeenCalledWith(validUserId);
    });

    it('stops event propagation when unblur button is clicked', () => {
      mockUseLiveQuery.mockReturnValue({ is_blurred: true });

      const parentClickHandler = vi.fn();

      render(
        <div onClick={parentClickHandler}>
          <AvatarWithFallback {...mockProps} avatarUrl={validAvatarUrl} />
        </div>,
      );

      const unblurButton = screen.getByTestId('unblur-button');
      fireEvent.click(unblurButton);

      expect(parentClickHandler).not.toHaveBeenCalled();
    });

    it('shows fallback for invalid avatar URL format', () => {
      mockUseLiveQuery.mockReturnValue(null);

      render(<AvatarWithFallback {...mockProps} avatarUrl="https://example.com/invalid-url" />);

      expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    });

    it('queries moderation status with correct userId and type', () => {
      render(<AvatarWithFallback {...mockProps} avatarUrl={validAvatarUrl} />);

      // useLiveQuery is called with a function, so we need to verify the dependency array
      expect(mockUseLiveQuery).toHaveBeenCalled();
      const lastCall = mockUseLiveQuery.mock.calls[mockUseLiveQuery.mock.calls.length - 1];
      expect(lastCall[1]).toEqual([validUserId]);
    });
  });
});

describe('AvatarWithFallback - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLiveQuery.mockReturnValue({ is_blurred: false });
  });

  it('matches snapshot when avatarUrl is provided', () => {
    const { container } = render(
      <AvatarWithFallback
        name="John Doe"
        avatarUrl="https://cdn.example.com/avatar/6mfxozzqmb36rc9rgy3rykoyfghfao74n8igt5tf1boehproahoy"
        className="size-16"
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when avatarUrl is not provided', () => {
    const { container } = render(
      <AvatarWithFallback name="Jane Smith" className="size-16" fallbackClassName="text-2xl" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom alt text', () => {
    const { container } = render(
      <AvatarWithFallback
        name="John Doe"
        avatarUrl="https://cdn.example.com/avatar/6mfxozzqmb36rc9rgy3rykoyfghfao74n8igt5tf1boehproahoy"
        alt="Custom alt"
        className="size-16"
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when image is blurred', () => {
    mockUseLiveQuery.mockReturnValue({ is_blurred: true });

    const { container } = render(
      <AvatarWithFallback
        name="John Doe"
        avatarUrl="https://cdn.example.com/avatar/6mfxozzqmb36rc9rgy3rykoyfghfao74n8igt5tf1boehproahoy"
        className="size-16"
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom data-testid', () => {
    const { container } = render(
      <AvatarWithFallback
        name="John Doe"
        avatarUrl="https://cdn.example.com/avatar/6mfxozzqmb36rc9rgy3rykoyfghfao74n8igt5tf1boehproahoy"
        className="size-16"
        data-testid="custom-avatar"
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
