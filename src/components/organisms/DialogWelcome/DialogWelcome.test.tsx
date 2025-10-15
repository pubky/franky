import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DialogWelcome } from './DialogWelcome';

const { mockGetAvatar, mockCopyToClipboard, mockSetShowWelcomeDialog } = vi.hoisted(() => ({
  mockGetAvatar: vi.fn((pubky: string) => `https://mocked.avatar/${pubky}`),
  mockCopyToClipboard: vi.fn(),
  mockSetShowWelcomeDialog: vi.fn(),
}));

vi.mock('@/core', () => ({
  filesApi: {
    getAvatar: mockGetAvatar,
  },
  useAuthStore: vi.fn(() => ({
    currentUserPubky: 'test-pubky-123',
  })),
  useOnboardingStore: vi.fn(() => ({
    showWelcomeDialog: true,
    setShowWelcomeDialog: mockSetShowWelcomeDialog,
  })),
  ProfileController: {
    read: vi.fn(() =>
      Promise.resolve({
        name: 'Test User',
        bio: 'Test bio',
        image: 'test-image.jpg',
      }),
    ),
  },
}));

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(() => {
    // Immediately resolve the callback to return user details
    return {
      name: 'Test User',
      bio: 'Test bio',
      image: 'test-image.jpg',
    };
  }),
}));

// Mock hooks
vi.mock('@/hooks', () => ({
  useCopyToClipboard: vi.fn(() => ({
    copyToClipboard: mockCopyToClipboard,
  })),
}));

// Mock libs
vi.mock('@/libs', () => ({
  formatPublicKey: vi.fn(({ key, length }) => `${key.slice(0, 4)}...${key.slice(-length + 4)}`),
  extractInitials: vi.fn(({ name }) =>
    name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase(),
  ),
  Key: ({ className }: { className?: string }) => <svg data-testid="key-icon" className={className} />,
  ArrowRight: ({ className }: { className?: string }) => <svg data-testid="arrow-right-icon" className={className} />,
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Dialog: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div data-testid="dialog" data-open={open} onClick={() => onOpenChange?.(false)}>
      {children}
    </div>
  ),
  DialogContent: ({
    children,
    className,
    hiddenTitle,
  }: {
    children: React.ReactNode;
    className?: string;
    hiddenTitle?: string;
  }) => (
    <div data-testid="dialog-content" className={className} data-hidden-title={hiddenTitle}>
      {children}
    </div>
  ),
  DialogHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-header" className={className}>
      {children}
    </div>
  ),
  DialogTitle: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <h2 data-testid="dialog-title" id={id}>
      {children}
    </h2>
  ),
  DialogDescription: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-description" className={className}>
      {children}
    </div>
  ),
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Typography: ({
    children,
    className,
    size,
  }: {
    children: React.ReactNode;
    as?: string;
    className?: string;
    size?: string;
  }) => {
    return (
      <p data-testid="typography" data-size={size} className={className}>
        {children}
      </p>
    );
  },
  Button: ({
    children,
    onClick,
    variant,
    className,
    size,
    id,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    className?: string;
    size?: string;
    id?: string;
  }) => (
    <button
      data-testid={variant === 'secondary' ? 'button-secondary' : 'button-primary'}
      onClick={onClick}
      data-variant={variant}
      className={className}
      data-size={size}
      id={id}
    >
      {children}
    </button>
  ),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src }: { src?: string }) => <img data-testid="avatar-image" src={src} alt="avatar" />,
  AvatarFallback: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar-fallback" className={className}>
      {children}
    </div>
  ),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  toast: vi.fn(() => ({
    dismiss: vi.fn(),
  })),
}));

describe('DialogWelcome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with user data from hooks', () => {
    render(<DialogWelcome />);

    const dialog = screen.getByTestId('dialog');
    const content = screen.getByTestId('dialog-content');
    const header = screen.getByTestId('dialog-header');
    const title = screen.getByTestId('dialog-title');

    expect(dialog).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Test bio')).toBeInTheDocument();
  });

  it('calls setShowWelcomeDialog when explore button is clicked', () => {
    render(<DialogWelcome />);

    const exploreButton = screen.getByText('Explore Pubky');
    fireEvent.click(exploreButton);

    expect(mockSetShowWelcomeDialog).toHaveBeenCalledWith(false);
  });

  it('calls copyToClipboard when copy button is clicked', () => {
    render(<DialogWelcome />);

    const copyButton = screen.getByTestId('button-secondary');
    fireEvent.click(copyButton);

    expect(mockCopyToClipboard).toHaveBeenCalledWith('test-pubky-123');
  });

  it('uses generated avatar url', () => {
    render(<DialogWelcome />);
    expect(mockGetAvatar).toHaveBeenCalledWith('test-pubky-123');
  });
});
