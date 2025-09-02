import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DialogWelcome } from './DialogWelcome';

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
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-header" className={className}>
      {children}
    </div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="dialog-title">{children}</h2>,
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
    as,
    className,
    size,
  }: {
    children: React.ReactNode;
    as?: string;
    className?: string;
    size?: string;
  }) => {
    const Tag = as || 'p';
    return (
      <Tag data-testid="typography" data-size={size} className={className}>
        {children}
      </Tag>
    );
  },
  Button: ({
    children,
    onClick,
    variant,
    className,
    size,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    className?: string;
    size?: string;
  }) => (
    <button
      data-testid={`button-${variant || 'default'}`}
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
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
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

// Mock libs
vi.mock('@/libs', () => ({
  formatPublicKey: vi.fn((key: string, length: number) => key.slice(0, length)),
  copyToClipboard: vi.fn(),
  Key: ({ className }: { className?: string }) => <div data-testid="key-icon" className={className} />,
  ArrowRight: ({ className }: { className?: string }) => <div data-testid="arrow-right-icon" className={className} />,
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  toast: vi.fn(() => ({
    dismiss: vi.fn(),
  })),
}));

describe('DialogWelcome', () => {
  const defaultProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    name: 'Satoshi Nakamoto',
    publicKey: 'test-public-key-12345',
    image: 'https://example.com/avatar.jpg',
    bio: 'Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<DialogWelcome {...defaultProps} />);

    const dialog = screen.getByTestId('dialog');
    const content = screen.getByTestId('dialog-content');
    const header = screen.getByTestId('dialog-header');
    const title = screen.getByTestId('dialog-title');

    expect(dialog).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });

  it('displays correct dialog title', () => {
    render(<DialogWelcome {...defaultProps} />);

    const title = screen.getByTestId('dialog-title');
    expect(title).toHaveTextContent('Welcome to Pubky!');
  });

  it('displays correct dialog description', () => {
    render(<DialogWelcome {...defaultProps} />);

    const description = screen.getByTestId('dialog-description');
    expect(description).toHaveTextContent('Your keys, your content, your rules.');
  });

  it('displays user name correctly', () => {
    render(<DialogWelcome {...defaultProps} />);

    const nameTypography = screen.getByText('Satoshi Nakamoto');
    expect(nameTypography).toBeInTheDocument();
  });

  it('displays user bio correctly', () => {
    render(<DialogWelcome {...defaultProps} />);

    const bioTypography = screen.getByText(
      'Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared.',
    );
    expect(bioTypography).toBeInTheDocument();
  });

  it('displays avatar with correct image', () => {
    render(<DialogWelcome {...defaultProps} />);

    const avatarImage = screen.getByTestId('avatar-image');
    expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('displays avatar fallback with correct initials', () => {
    render(<DialogWelcome {...defaultProps} />);

    const avatarFallback = screen.getByTestId('avatar-fallback');
    expect(avatarFallback).toHaveTextContent('SN');
  });

  it('calculates initials correctly from name', () => {
    render(<DialogWelcome {...defaultProps} name="John Doe Smith" />);

    const avatarFallback = screen.getByTestId('avatar-fallback');
    expect(avatarFallback).toHaveTextContent('JD');
  });

  it('displays public key in copy button', () => {
    render(<DialogWelcome {...defaultProps} />);

    // Check that the public key is displayed in the copy button
    const copyButton = screen.getByTestId('button-secondary');
    // The button should contain some text content (the formatted public key)
    expect(copyButton).toHaveTextContent(/\w+/);
  });

  it('displays copy button with key icon', () => {
    render(<DialogWelcome {...defaultProps} />);

    const copyButton = screen.getByTestId('button-secondary');
    const keyIcon = screen.getByTestId('key-icon');

    expect(copyButton).toBeInTheDocument();
    expect(keyIcon).toBeInTheDocument();
  });

  it('displays explore button with arrow icon', () => {
    render(<DialogWelcome {...defaultProps} />);

    const exploreButton = screen.getByText('Explore Pubky');
    const arrowIcon = screen.getByTestId('arrow-right-icon');

    expect(exploreButton).toBeInTheDocument();
    expect(arrowIcon).toBeInTheDocument();
  });

  it('calls onOpenChange when explore button is clicked', () => {
    const onOpenChange = vi.fn();
    render(<DialogWelcome {...defaultProps} onOpenChange={onOpenChange} />);

    const exploreButton = screen.getByText('Explore Pubky');
    fireEvent.click(exploreButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('copy button is clickable', () => {
    render(<DialogWelcome {...defaultProps} />);

    const copyButton = screen.getByTestId('button-secondary');
    expect(copyButton).toBeInTheDocument();
    expect(copyButton).toHaveAttribute('data-variant', 'secondary');
  });

  it('applies correct styling to dialog content', () => {
    render(<DialogWelcome {...defaultProps} />);

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('sm:max-w-xl');
  });

  it('applies correct styling to dialog header', () => {
    render(<DialogWelcome {...defaultProps} />);

    const header = screen.getByTestId('dialog-header');
    expect(header).toHaveClass('text-left', 'pr-6', 'gap-0');
  });

  it('renders scrollable content area', () => {
    render(<DialogWelcome {...defaultProps} />);

    const scrollableArea = document.querySelector('.max-h-\\[420px\\]');
    expect(scrollableArea).toBeInTheDocument();
    expect(scrollableArea).toHaveClass('max-h-[420px]', 'overflow-y-auto');
  });

  it('applies responsive layout classes to card', () => {
    render(<DialogWelcome {...defaultProps} />);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass(
      'flex-col',
      'sm:flex-row',
      'justify-center',
      'sm:justify-start',
      'items-center',
      'sm:items-start',
    );
  });

  it('applies responsive layout classes to content container', () => {
    render(<DialogWelcome {...defaultProps} />);

    // Find the container that contains the avatar content with responsive classes
    const containers = screen.getAllByTestId('container');
    const avatarContentContainer = containers.find(
      (container) => container.className?.includes('justify-center') || container.className?.includes('items-center'),
    );

    expect(avatarContentContainer).toBeInTheDocument();
    expect(avatarContentContainer).toHaveClass(
      'flex',
      'flex-col',
      'justify-center',
      'sm:justify-start',
      'items-center',
      'sm:items-start',
    );
  });

  it('applies responsive text alignment to bio', () => {
    render(<DialogWelcome {...defaultProps} />);

    const bioTypography = screen.getByText(
      'Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared.',
    );
    expect(bioTypography).toHaveClass('text-center', 'sm:text-left');
  });

  it('works without optional props', () => {
    const minimalProps = {
      isOpen: true,
      onOpenChange: vi.fn(),
      name: 'Test User',
      publicKey: 'test-key',
    };

    render(<DialogWelcome {...minimalProps} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('TU')).toBeInTheDocument(); // Initials
    expect(screen.getByText('test-key')).toBeInTheDocument();
  });

  it('handles empty name gracefully', () => {
    render(<DialogWelcome {...defaultProps} name="" />);

    const avatarFallback = screen.getByTestId('avatar-fallback');
    expect(avatarFallback).toHaveTextContent('');
  });

  it('handles single word name', () => {
    render(<DialogWelcome {...defaultProps} name="Satoshi" />);

    const avatarFallback = screen.getByTestId('avatar-fallback');
    expect(avatarFallback).toHaveTextContent('S');
  });
});
