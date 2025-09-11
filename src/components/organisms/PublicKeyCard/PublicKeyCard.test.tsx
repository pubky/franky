import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PublicKeyCard } from './PublicKeyCard';

// Mock navigator.clipboard (not needed anymore since we mock Libs.copyToClipboard directly)
// const mockWriteText = vi.fn();
// Object.assign(navigator, {
//   clipboard: {
//     writeText: mockWriteText,
//   },
// });

// Hoisted mocks so they can be used inside vi.mock factories
const { mockToast, mockDismiss } = vi.hoisted(() => ({
  mockToast: vi.fn(),
  mockDismiss: vi.fn(),
}));

interface ImageProps {
  src: string;
  alt: string;
  size?: string;
}

interface ActionProps {
  onClick: () => void;
  variant?: string;
  icon?: React.ReactNode;
  label: string;
}

// Mock molecules
vi.mock('@/molecules', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
  toast: mockToast,
  ContentCard: ({ children, image }: { children: React.ReactNode; image?: ImageProps }) => (
    <div data-testid="content-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {image && <img data-testid="content-card-image" src={image.src} alt={image.alt} data-size={image.size} />}
      {children}
    </div>
  ),
  PopoverPublicKey: () => <div data-testid="popover-public-key">Popover</div>,
  ActionSection: ({
    children,
    actions,
    className,
  }: {
    children: React.ReactNode;
    actions?: ActionProps[];
    className?: string;
  }) => (
    <div data-testid="action-section" className={className}>
      {actions?.map((action: ActionProps, index: number) => (
        <button
          key={index}
          data-testid={`action-button-${index}`}
          onClick={action.onClick}
          data-variant={action.variant}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
      {children}
    </div>
  ),
  InputField: ({
    value,
    variant,
    readOnly,
    onClick,
    loading,
    loadingText,
    loadingIcon,
    icon,
  }: {
    value?: string;
    variant?: string;
    readOnly?: boolean;
    onClick?: () => void;
    loading?: boolean;
    loadingText?: string;
    loadingIcon?: React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <div data-testid="input-field">
      {loading ? (
        <div data-testid="loading">
          {loadingIcon}
          {loadingText}
        </div>
      ) : (
        <div>
          {icon}
          <input data-testid="input" value={value} readOnly={readOnly} onClick={onClick} data-variant={variant} />
        </div>
      )}
    </div>
  ),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Heading: ({ children, level, size }: { children: React.ReactNode; level: number; size?: string }) => (
    <div data-testid={`heading-${level}`} data-size={size}>
      {children}
    </div>
  ),
  Button: ({
    children,
    variant,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
    onClick?: () => void;
  }) => (
    <button
      data-testid={variant ? `button-${variant}` : 'button'}
      className={className}
      onClick={onClick}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

// Mock core
const mockSetKeypair = vi.fn();
const mockSetMnemonic = vi.fn();
const mockPubky = 'pubky1234567890abcdef';

vi.mock('@/core', () => ({
  useOnboardingStore: () => ({
    setKeypair: mockSetKeypair,
    setMnemonic: mockSetMnemonic,
    pubky: mockPubky,
  }),
}));

// Mock hooks
const mockCopyToClipboard = vi.fn();

vi.mock('@/hooks', () => ({
  useCopyToClipboard: vi.fn(() => ({
    copyToClipboard: mockCopyToClipboard,
  })),
}));

// Mock libs
const { mockShareWithFallback } = vi.hoisted(() => ({
  mockShareWithFallback: vi.fn(),
}));

vi.mock('@/libs', () => ({
  Identity: {
    generateKeypair: vi.fn(() => ({
      pubky: 'test-public-key',
      secretKey: 'test-secret-key-64-chars-long-hex-string-for-testing-purposes',
      mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    })),
  },
  shareWithFallback: mockShareWithFallback,
  Copy: ({ className }: { className?: string }) => (
    <div data-testid="copy-icon" className={className}>
      Copy
    </div>
  ),
  Share: ({ className }: { className?: string }) => (
    <div data-testid="share-icon" className={className}>
      Share
    </div>
  ),
  Key: ({ className }: { className?: string }) => (
    <div data-testid="key-icon" className={className}>
      Key
    </div>
  ),
}));

describe('PublicKeyCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockReturnValue({ dismiss: mockDismiss });
    mockCopyToClipboard.mockResolvedValue(undefined);
    mockShareWithFallback.mockResolvedValue({ success: true, method: 'native' });
  });

  it('renders content card with image', () => {
    render(<PublicKeyCard />);

    expect(screen.getByTestId('content-card')).toBeInTheDocument();

    const image = screen.getByTestId('content-card-image');
    expect(image).toHaveAttribute('src', '/images/key.png');
    expect(image).toHaveAttribute('alt', 'Key');
  });

  it('renders heading and popover', () => {
    render(<PublicKeyCard />);

    expect(screen.getByTestId('heading-3')).toBeInTheDocument();
    expect(screen.getByText('Your pubky')).toBeInTheDocument();
    expect(screen.getByTestId('popover-public-key')).toBeInTheDocument();
  });

  it('renders action section with copy and share buttons', () => {
    render(<PublicKeyCard />);

    expect(screen.getByTestId('action-section')).toBeInTheDocument();
    expect(screen.getByTestId('action-button-0')).toBeInTheDocument();
    expect(screen.getByTestId('action-button-1')).toBeInTheDocument();
    expect(screen.getByText('Copy to clipboard')).toBeInTheDocument();
    expect(screen.getByTestId('share-icon')).toBeInTheDocument();
  });

  it('renders input field with public key', () => {
    render(<PublicKeyCard />);

    expect(screen.getByTestId('input-field')).toBeInTheDocument();

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('value', mockPubky);
    expect(input).toHaveAttribute('readOnly');
    expect(input).toHaveAttribute('data-variant', 'dashed');
  });

  it('handles copy to clipboard action', async () => {
    render(<PublicKeyCard />);

    const copyButton = screen.getByTestId('action-button-0');
    fireEvent.click(copyButton);

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockCopyToClipboard).toHaveBeenCalledWith(mockPubky);
    // Note: The toast is now handled internally by useCopyToClipboard hook
  });

  it('handles input field click for copy', async () => {
    render(<PublicKeyCard />);

    const input = screen.getByTestId('input');
    fireEvent.click(input);

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockCopyToClipboard).toHaveBeenCalledWith(mockPubky);
    // Note: The toast is now handled internally by useCopyToClipboard hook
  });

  it('calls copyToClipboard when copy button is clicked', () => {
    render(<PublicKeyCard />);

    const copyButton = screen.getByTestId('action-button-0');
    fireEvent.click(copyButton);

    // The button should be clickable and not throw any errors
    expect(copyButton).toBeInTheDocument();
    expect(mockCopyToClipboard).toHaveBeenCalledWith(mockPubky);
  });

  it('has correct action section styling', () => {
    render(<PublicKeyCard />);

    const actionSection = screen.getByTestId('action-section');
    expect(actionSection.className).toContain('flex-col items-start gap-3 justify-start w-full');
  });

  it('has correct copy button variant', () => {
    render(<PublicKeyCard />);

    const copyButton = screen.getByTestId('action-button-0');
    expect(copyButton).toHaveAttribute('data-variant', 'secondary');
  });

  it('has correct share button variant', () => {
    render(<PublicKeyCard />);

    const shareButton = screen.getByTestId('action-button-1');
    expect(shareButton).toHaveAttribute('data-variant', 'secondary');
  });

  it('handles share action with native sharing', async () => {
    render(<PublicKeyCard />);

    const shareButton = screen.getByTestId('action-button-1');
    fireEvent.click(shareButton);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockShareWithFallback).toHaveBeenCalledWith(
      {
        title: 'My Pubky',
        text: `Here is my Pubky:\n${mockPubky}`,
      },
      expect.objectContaining({
        onFallback: expect.any(Function),
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it('handles share action with fallback to clipboard', async () => {
    // Mock shareWithFallback to simulate fallback scenario
    mockShareWithFallback.mockImplementation(async (data, options) => {
      // Simulate fallback being called
      await options.onFallback?.();
      // Simulate success callback with fallback method
      options.onSuccess?.({ success: true, method: 'fallback' });
      return { success: true, method: 'fallback' };
    });

    render(<PublicKeyCard />);

    const shareButton = screen.getByTestId('action-button-1');
    fireEvent.click(shareButton);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockShareWithFallback).toHaveBeenCalled();
    expect(mockCopyToClipboard).toHaveBeenCalledWith(mockPubky);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Pubky copied',
      description: 'Paste it into your favorite app to share it.',
    });
  });

  it('handles share action error', async () => {
    // Mock shareWithFallback to simulate error scenario
    mockShareWithFallback.mockImplementation(async (data, options) => {
      const error = new Error('Share failed');
      options.onError?.(error);
      throw error;
    });

    render(<PublicKeyCard />);

    const shareButton = screen.getByTestId('action-button-1');
    fireEvent.click(shareButton);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockShareWithFallback).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Share failed',
      description: 'Unable to share right now. Please try again.',
    });
  });
});

describe('PublicKeyCard - Key Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockReturnValue({ dismiss: mockDismiss });
    mockCopyToClipboard.mockResolvedValue(undefined);
    mockShareWithFallback.mockResolvedValue({ success: true, method: 'native' });
  });

  it('does not generate keypair when public key already exists', () => {
    render(<PublicKeyCard />);

    // Since mockPublicKey is not empty, the component should not call generateKeypair
    // We can't easily access the mocked function here due to module hoisting,
    // but we can verify that the store methods were not called
    expect(mockSetKeypair).not.toHaveBeenCalled();
    expect(mockSetMnemonic).not.toHaveBeenCalled();
  });
});

describe('PublicKeyCard - Snapshots', () => {
  it('matches snapshot for default PublicKeyCard', () => {
    const { container } = render(<PublicKeyCard />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
