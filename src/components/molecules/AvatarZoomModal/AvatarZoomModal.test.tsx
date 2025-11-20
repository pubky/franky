import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AvatarZoomModal } from './AvatarZoomModal';

// Mock hooks
vi.mock('@/hooks', () => ({
  useBodyScrollLock: vi.fn(),
}));

// Mock Atoms components
vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    onClick,
    'data-testid': testId,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    'data-testid'?: string;
    [key: string]: unknown;
  }) => {
    return (
      <div className={className} onClick={onClick} data-testid={testId} {...props}>
        {children}
      </div>
    );
  },
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => <img data-testid="avatar-image" src={src} alt={alt} />,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <div data-testid="avatar-fallback">{children}</div>,
}));

// Mock Molecules components
vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    AvatarWithFallback: ({
      avatarUrl,
      name,
      className,
      fallbackClassName,
      alt,
    }: {
      avatarUrl?: string;
      name: string;
      className?: string;
      fallbackClassName?: string;
      alt?: string;
    }) => (
      <div data-testid="avatar" className={className}>
        {avatarUrl ? (
          <img data-testid="avatar-image" src={avatarUrl} alt={alt || name} />
        ) : (
          <div data-testid="avatar-fallback" className={fallbackClassName}>
            {name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
        )}
      </div>
    ),
  };
});

// Mock libs - use real extractInitials
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
  };
});

describe('AvatarZoomModal', () => {
  const mockProps = {
    open: true,
    onClose: vi.fn(),
    avatarUrl: 'https://example.com/avatar.jpg',
    name: 'John Doe',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open is true', () => {
    render(<AvatarZoomModal {...mockProps} />);

    expect(screen.getByAltText("John Doe's avatar")).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<AvatarZoomModal {...mockProps} open={false} />);

    expect(screen.queryByAltText("John Doe's avatar")).not.toBeInTheDocument();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    render(<AvatarZoomModal {...mockProps} onClose={onClose} />);

    const overlay = screen.getByTestId('avatar-zoom-modal-overlay');
    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when avatar content is clicked', () => {
    const onClose = vi.fn();
    render(<AvatarZoomModal {...mockProps} onClose={onClose} />);

    const content = screen.getByTestId('avatar-zoom-modal-content');
    fireEvent.click(content);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<AvatarZoomModal {...mockProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders avatar fallback when avatarUrl is not provided', () => {
    render(<AvatarZoomModal {...mockProps} avatarUrl={undefined} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders avatar image when avatarUrl is provided', () => {
    render(<AvatarZoomModal {...mockProps} />);

    const avatarImage = screen.getByAltText("John Doe's avatar");
    expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('uses extractInitials for fallback when no avatarUrl', () => {
    render(<AvatarZoomModal {...mockProps} avatarUrl={undefined} name="Alice Bob" />);

    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('calls useBodyScrollLock with open prop', async () => {
    const hooks = await import('@/hooks');
    render(<AvatarZoomModal {...mockProps} />);

    expect(hooks.useBodyScrollLock).toHaveBeenCalledWith(true);
  });

  describe('Event Listener Cleanup', () => {
    it('removes event listener when component unmounts', () => {
      const onClose = vi.fn();
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = render(<AvatarZoomModal {...mockProps} onClose={onClose} />);

      // Event listener should be added when open
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      unmount();

      // Event listener should be removed on unmount
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('removes event listener when modal closes', () => {
      const onClose = vi.fn();
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { rerender } = render(<AvatarZoomModal {...mockProps} onClose={onClose} />);

      // Clear call counts after initial render
      addEventListenerSpy.mockClear();
      removeEventListenerSpy.mockClear();

      // Close the modal
      rerender(<AvatarZoomModal {...mockProps} onClose={onClose} open={false} />);

      // Event listener should be removed when modal closes
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('does not add event listener when modal is initially closed', () => {
      const onClose = vi.fn();
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      render(<AvatarZoomModal {...mockProps} onClose={onClose} open={false} />);

      // Event listener should not be added when modal is closed
      expect(addEventListenerSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('adds event listener when modal opens', () => {
      const onClose = vi.fn();
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      const { rerender } = render(<AvatarZoomModal {...mockProps} onClose={onClose} open={false} />);

      // Clear call counts after initial render
      addEventListenerSpy.mockClear();

      // Open the modal
      rerender(<AvatarZoomModal {...mockProps} onClose={onClose} open={true} />);

      // Event listener should be added when modal opens
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('does not stack multiple event listeners on rapid open/close', () => {
      const onClose = vi.fn();
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { rerender } = render(<AvatarZoomModal {...mockProps} onClose={onClose} open={true} />);

      // Rapidly close and reopen
      rerender(<AvatarZoomModal {...mockProps} onClose={onClose} open={false} />);
      rerender(<AvatarZoomModal {...mockProps} onClose={onClose} open={true} />);
      rerender(<AvatarZoomModal {...mockProps} onClose={onClose} open={false} />);
      rerender(<AvatarZoomModal {...mockProps} onClose={onClose} open={true} />);

      // Should have removed listeners each time
      expect(removeEventListenerSpy.mock.calls.length).toBeGreaterThanOrEqual(4);

      // Fire escape key - should only call onClose once
      onClose.mockClear();
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('cleanup function is always registered regardless of open state', () => {
      const onClose = vi.fn();
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      // Start with modal closed
      const { unmount } = render(<AvatarZoomModal {...mockProps} onClose={onClose} open={false} />);

      removeEventListenerSpy.mockClear();

      // Unmount - cleanup should be called even though modal was never opened
      unmount();

      // Cleanup function should be called on unmount
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});

describe('AvatarZoomModal - Snapshots', () => {
  it('matches snapshot when open with avatar image', () => {
    const { container } = render(
      <AvatarZoomModal open={true} onClose={vi.fn()} avatarUrl="https://example.com/avatar.jpg" name="John Doe" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when open with fallback initials', () => {
    const { container } = render(<AvatarZoomModal open={true} onClose={vi.fn()} name="Jane Smith" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when closed', () => {
    const { container } = render(
      <AvatarZoomModal open={false} onClose={vi.fn()} avatarUrl="https://example.com/avatar.jpg" name="John Doe" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
