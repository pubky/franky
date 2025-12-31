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

// Use real libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
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
