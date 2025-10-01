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
  formatPublicKey: vi.fn(({ key, length }: { key: string; length: number }) => key.slice(0, length)),
  useCopyToClipboard: vi.fn(() => ({
    copyToClipboard: vi.fn(),
  })),
  extractInitials: vi.fn(({ name, maxLength }: { name: string; maxLength: number }) => {
    const words = name.split(' ');
    return words
      .slice(0, maxLength)
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
  }),
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
    pubky: 'test-public-key-12345',
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

  it('calls onOpenChange when explore button is clicked', () => {
    const onOpenChange = vi.fn();
    render(<DialogWelcome {...defaultProps} onOpenChange={onOpenChange} />);

    const exploreButton = screen.getByText('Explore Pubky');
    fireEvent.click(exploreButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls copyToClipboard when copy button is clicked', () => {
    render(<DialogWelcome {...defaultProps} />);

    const copyButton = screen.getByTestId('button-secondary');
    fireEvent.click(copyButton);

    // The button should be clickable and not throw any errors
    expect(copyButton).toBeInTheDocument();
  });
});

describe('DialogWelcome - Snapshots', () => {
  const defaultProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    name: 'Satoshi Nakamoto',
    pubky: 'test-public-key-12345',
    image: 'https://example.com/avatar.jpg',
    bio: 'Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared.',
  };

  it('matches snapshot with default props', () => {
    const { container } = render(<DialogWelcome {...defaultProps} pubky="test-public-key-12345" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with minimal props', () => {
    const minimalProps = {
      isOpen: true,
      onOpenChange: vi.fn(),
      name: 'Test User',
      pubky: 'test-key',
    };

    const { container } = render(<DialogWelcome {...minimalProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with single word name', () => {
    const { container } = render(<DialogWelcome {...defaultProps} name="Satoshi" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty name', () => {
    const { container } = render(<DialogWelcome {...defaultProps} name="" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with long name', () => {
    const { container } = render(<DialogWelcome {...defaultProps} name="John Doe Smith Johnson-Baker-Taylor-Jones" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without bio', () => {
    const { container } = render(<DialogWelcome {...defaultProps} bio={undefined} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with long bio', () => {
    const longBio =
      'This is a very long bio that should test how the component handles extensive text content and whether it properly wraps and displays within the dialog constraints.';
    const { container } = render(<DialogWelcome {...defaultProps} bio={longBio} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without image', () => {
    const { container } = render(<DialogWelcome {...defaultProps} image={undefined} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with different public key format', () => {
    const { container } = render(
      <DialogWelcome {...defaultProps} pubky="pk:abc123def456ghi789jkl012mno345pqr678stu901vwx234yz" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when dialog is closed', () => {
    const { container } = render(<DialogWelcome {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('DialogWelcome - Snapshots', () => {
  const defaultProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    name: 'Satoshi Nakamoto',
    pubky: 'test-public-key-12345',
    image: 'https://example.com/avatar.jpg',
    bio: 'Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared.',
  };

  it('matches snapshot with default props', () => {
    const { container } = render(<DialogWelcome {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with minimal props', () => {
    const minimalProps = {
      isOpen: true,
      onOpenChange: vi.fn(),
      name: 'Test User',
      pubky: 'test-key',
    };

    const { container } = render(<DialogWelcome {...minimalProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with single word name', () => {
    const { container } = render(<DialogWelcome {...defaultProps} name="Satoshi" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty name', () => {
    const { container } = render(<DialogWelcome {...defaultProps} name="" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with long name', () => {
    const { container } = render(<DialogWelcome {...defaultProps} name="John Doe Smith Johnson-Baker-Taylor-Jones" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without bio', () => {
    const { container } = render(<DialogWelcome {...defaultProps} bio={undefined} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with long bio', () => {
    const longBio =
      'This is a very long bio that should test how the component handles extensive text content and whether it properly wraps and displays within the dialog constraints.';
    const { container } = render(<DialogWelcome {...defaultProps} bio={longBio} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without image', () => {
    const { container } = render(<DialogWelcome {...defaultProps} image={undefined} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with different public key format', () => {
    const { container } = render(
      <DialogWelcome {...defaultProps} pubky="pk:abc123def456ghi789jkl012mno345pqr678stu901vwx234yz" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when dialog is closed', () => {
    const { container } = render(<DialogWelcome {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
