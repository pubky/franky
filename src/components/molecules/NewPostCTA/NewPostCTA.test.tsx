import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NewPostCTA } from './NewPostCTA';

// Mock hooks - default to authenticated user
const mockUseAuthStatus = vi.fn(() => ({
  isFullyAuthenticated: true,
  isLoading: false,
  status: 'AUTHENTICATED',
  hasKeypair: true,
  hasProfile: true,
}));

vi.mock('@/hooks', () => ({
  useAuthStatus: () => mockUseAuthStatus(),
}));

// Mock Radix UI Dialog components
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div data-testid="dialog-root" data-open={open} onClick={() => onOpenChange?.(true)}>
      {children}
    </div>
  ),
  Trigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dialog-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  Content: ({
    children,
    className,
    hiddenTitle,
  }: {
    children: React.ReactNode;
    className?: string;
    hiddenTitle?: string;
  }) => (
    <div data-testid="dialog-content" className={className} aria-label={hiddenTitle}>
      {children}
    </div>
  ),
  Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-portal">{children}</div>,
  Overlay: ({ className }: { className?: string }) => <div data-testid="dialog-overlay" className={className} />,
  Close: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <button data-testid="dialog-close" className={className}>
      {children}
    </button>
  ),
  Title: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid="dialog-title" className={className}>
      {children}
    </h2>
  ),
  Description: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p data-testid="dialog-description" className={className}>
      {children}
    </p>
  ),
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  DialogNewPost: vi.fn(
    ({ open, onOpenChangeAction }: { open: boolean; onOpenChangeAction: (open: boolean) => void }) => (
      <div data-testid="dialog-new-post" data-open={open}>
        <button data-testid="mock-close-btn" onClick={() => onOpenChangeAction(false)}>
          Close
        </button>
      </div>
    ),
  ),
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
    <div data-testid="dialog" data-open={open} onClick={() => onOpenChange?.(true)}>
      {children}
    </div>
  ),
  DialogTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dialog-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  Button: ({
    children,
    className,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    'data-testid'?: string;
    'aria-label'?: string;
    [key: string]: unknown;
  }) => (
    <button data-testid={dataTestId} className={className} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
}));

// Use real libs, only stub cn to a deterministic join
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  };
});

describe('NewPostCTA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to authenticated state for most tests
    mockUseAuthStatus.mockReturnValue({
      isFullyAuthenticated: true,
      isLoading: false,
      status: 'AUTHENTICATED',
      hasKeypair: true,
      hasProfile: true,
    });
  });

  it('renders button with correct test id', () => {
    render(<NewPostCTA />);
    expect(screen.getByTestId('new-post-cta')).toBeInTheDocument();
  });

  it('returns null when user is not authenticated', () => {
    mockUseAuthStatus.mockReturnValue({
      isFullyAuthenticated: false,
      isLoading: false,
      status: 'UNAUTHENTICATED',
      hasKeypair: false,
      hasProfile: false,
    });
    const { container } = render(<NewPostCTA />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null while loading auth status', () => {
    mockUseAuthStatus.mockReturnValue({
      isFullyAuthenticated: false,
      isLoading: true,
      status: 'UNAUTHENTICATED',
      hasKeypair: false,
      hasProfile: false,
    });
    const { container } = render(<NewPostCTA />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Plus icon', () => {
    render(<NewPostCTA />);
    expect(document.querySelector('.lucide-plus')).toBeInTheDocument();
  });

  it('has correct positioning classes', () => {
    render(<NewPostCTA />);
    const button = screen.getByTestId('new-post-cta');
    expect(button).toHaveClass('fixed');
    expect(button).toHaveClass('bottom-[72px]');
    expect(button).toHaveClass('right-3');
    expect(button).toHaveClass('md:bottom-20');
    expect(button).toHaveClass('lg:bottom-6');
    expect(button).toHaveClass('sm:right-10');
  });

  it('has correct size classes', () => {
    render(<NewPostCTA />);
    const button = screen.getByTestId('new-post-cta');
    expect(button).toHaveClass('w-20');
    expect(button).toHaveClass('h-20');
    expect(button).toHaveClass('rounded-full');
  });

  it('has hover background class', () => {
    render(<NewPostCTA />);
    const button = screen.getByTestId('new-post-cta');
    expect(button).toHaveClass('hover:bg-brand');
  });

  it('has correct z-index', () => {
    render(<NewPostCTA />);
    const button = screen.getByTestId('new-post-cta');
    expect(button).toHaveClass('z-40');
  });

  it('has aria-label for accessibility', () => {
    render(<NewPostCTA />);
    const button = screen.getByTestId('new-post-cta');
    expect(button).toHaveAttribute('aria-label', 'New post');
  });

  it('opens dialog when button is clicked', () => {
    render(<NewPostCTA />);
    const button = screen.getByTestId('new-post-cta');
    const dialog = screen.getByTestId('dialog');

    expect(dialog).toHaveAttribute('data-open', 'false');

    fireEvent.click(button);

    // Dialog should be opened (state managed internally)
    expect(screen.getByTestId('dialog-new-post')).toBeInTheDocument();
  });
});

describe('NewPostCTA - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot with default state', () => {
    const { container } = render(<NewPostCTA />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
