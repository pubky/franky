import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DialogNewPost } from './DialogNewPost';

// Mock molecules
vi.mock('@/molecules', () => ({
  DialogConfirmDiscard: ({
    open,
    onOpenChange,
    onConfirm,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
  }) => (
    <div data-testid="dialog-confirm-discard" data-open={open}>
      <button data-testid="mock-confirm-btn" onClick={onConfirm}>
        Confirm
      </button>
      <button data-testid="mock-cancel-btn" onClick={() => onOpenChange(false)}>
        Cancel
      </button>
    </div>
  ),
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  PostInput: vi.fn(
    ({
      variant,
      onSuccess,
      expanded,
      onContentChange,
    }: {
      variant: string;
      onSuccess?: () => void;
      expanded?: boolean;
      onContentChange?: (content: string, tags: string[]) => void;
    }) => (
      <div data-testid="post-input" data-variant={variant} data-expanded={expanded}>
        <button data-testid="mock-success-btn" onClick={onSuccess}>
          Success
        </button>
        <button data-testid="mock-content-change-btn" onClick={() => onContentChange?.('test content', ['tag1'])}>
          Change Content
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
    <div data-testid="dialog" data-open={open} onClick={() => onOpenChange?.(false)}>
      {children}
    </div>
  ),
  DialogContent: ({
    children,
    className,
    hiddenTitle,
    'aria-describedby': ariaDescribedBy,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    hiddenTitle?: string;
    'aria-describedby'?: string;
    [key: string]: unknown;
  }) => (
    <div
      data-testid="dialog-content"
      className={className}
      aria-label={hiddenTitle}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="dialog-description">{children}</p>
  ),
  Container: ({
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
}));

// Use real libs - use actual implementations
vi.mock('@/libs', async () => {
  const actual = await vi.importActual('@/libs');
  return { ...actual };
});

describe('DialogNewPost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with required props', () => {
    const onOpenChangeAction = vi.fn();
    render(<DialogNewPost open={false} onOpenChangeAction={onOpenChangeAction} />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('New Post');
    expect(screen.getByTestId('post-input')).toBeInTheDocument();
  });

  it('calls onOpenChangeAction when PostInput onSuccess is called', async () => {
    const onOpenChangeAction = vi.fn();
    render(<DialogNewPost open={false} onOpenChangeAction={onOpenChangeAction} />);

    const successButton = screen.getByTestId('mock-success-btn');
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(onOpenChangeAction).toHaveBeenCalledWith(false);
    });
  });

  it('handles open prop correctly', () => {
    const onOpenChangeAction = vi.fn();
    const { rerender } = render(<DialogNewPost open={false} onOpenChangeAction={onOpenChangeAction} />);

    let dialog = screen.getByTestId('dialog');
    expect(dialog).toHaveAttribute('data-open', 'false');

    rerender(<DialogNewPost open={true} onOpenChangeAction={onOpenChangeAction} />);
    dialog = screen.getByTestId('dialog');
    expect(dialog).toHaveAttribute('data-open', 'true');
  });
});

describe('DialogNewPost - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot with default props', () => {
    const onOpenChangeAction = vi.fn();
    const { container } = render(<DialogNewPost open={false} onOpenChangeAction={onOpenChangeAction} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with open prop', () => {
    const onOpenChangeAction = vi.fn();
    const { container } = render(<DialogNewPost open={true} onOpenChangeAction={onOpenChangeAction} />);
    expect(container).toMatchSnapshot();
  });
});
