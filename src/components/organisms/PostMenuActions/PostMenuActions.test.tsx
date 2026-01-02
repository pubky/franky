import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostMenuActions } from './PostMenuActions';
import { normaliseRadixIds } from '@/libs/utils/utils';

const mockUseIsMobile = vi.fn(() => false);
const mockUsePostMenuActions = vi.fn(() => ({
  menuItems: [],
  isLoading: false,
}));

vi.mock('@/hooks', () => ({
  useIsMobile: () => mockUseIsMobile(),
  usePostMenuActions: (postId: string) => mockUsePostMenuActions(postId),
}));

// Mock DialogReportPost
vi.mock('@/organisms', () => ({
  DialogReportPost: ({ open, postId }: { open: boolean; onOpenChange: (open: boolean) => void; postId: string }) => (
    <div data-testid="dialog-report-post" data-open={open.toString()} data-post-id={postId}>
      DialogReportPost
    </div>
  ),
}));

vi.mock('@/libs', async () => {
  const actual = await vi.importActual('@/libs');
  return {
    ...actual,
  };
});

vi.mock('./PostMenuActionsContent', () => ({
  PostMenuActionsContent: ({
    postId,
    variant,
    onActionComplete,
    onReportClick,
  }: {
    postId: string;
    variant: string;
    onActionComplete?: () => void;
    onReportClick?: () => void;
  }) => (
    <div data-testid="post-menu-actions-content" data-post-id={postId} data-variant={variant}>
      <button onClick={onActionComplete}>Close</button>
      <button onClick={onReportClick} data-testid="report-button">
        Report
      </button>
    </div>
  ),
}));

vi.mock('@/atoms', () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => (
    <div data-testid="sheet" data-open={open.toString()}>
      {children}
    </div>
  ),
  SheetTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="sheet-trigger">{children}</div>
  ),
  SheetContent: ({
    children,
    side,
  }: {
    children: React.ReactNode;
    side: string;
    onOpenAutoFocus?: (e: { preventDefault: () => void }) => void;
  }) => (
    <div data-testid="sheet-content" data-side={side}>
      {children}
    </div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sheet-title" className={className}>
      {children}
    </div>
  ),
  DropdownMenu: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div data-testid="dropdown-menu" data-open={open.toString()}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({
    children,
    align,
    className,
  }: {
    children: React.ReactNode;
    align: string;
    className?: string;
    onCloseAutoFocus?: (e: { preventDefault: () => void }) => void;
  }) => (
    <div data-testid="dropdown-content" data-align={align} className={className}>
      {children}
    </div>
  ),
  Container: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
    overrideDefaults?: boolean;
  }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Button: ({
    children,
    onClick,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    'aria-label'?: string;
  }) => (
    <button onClick={onClick} aria-label={ariaLabel} data-testid="button">
      {children}
    </button>
  ),
}));

describe('PostMenuActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseIsMobile.mockReturnValue(false);
  });

  it('renders dropdown menu on desktop', () => {
    const trigger = <button>Menu</button>;
    render(<PostMenuActions postId="pk:test123:post456" trigger={trigger} />);

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    expect(screen.queryByTestId('sheet')).not.toBeInTheDocument();
  });

  it('renders sheet on mobile', () => {
    mockUseIsMobile.mockReturnValue(true);
    const trigger = <button>Menu</button>;
    render(<PostMenuActions postId="pk:test123:post456" trigger={trigger} />);

    expect(screen.getByTestId('sheet')).toBeInTheDocument();
    expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
  });

  it('passes correct variant to PostMenuActionsContent', () => {
    const trigger = <button>Menu</button>;
    render(<PostMenuActions postId="pk:test123:post456" trigger={trigger} />);

    const content = screen.getByTestId('post-menu-actions-content');
    expect(content).toHaveAttribute('data-variant', 'dropdown');
  });

  it('passes sheet variant on mobile', () => {
    mockUseIsMobile.mockReturnValue(true);
    const trigger = <button>Menu</button>;
    render(<PostMenuActions postId="pk:test123:post456" trigger={trigger} />);

    const content = screen.getByTestId('post-menu-actions-content');
    expect(content).toHaveAttribute('data-variant', 'sheet');
  });

  it('closes menu when action is completed', async () => {
    const user = userEvent.setup();
    const trigger = <button>Menu</button>;
    render(<PostMenuActions postId="pk:test123:post456" trigger={trigger} />);

    const closeButton = screen.getByText('Close');
    await user.click(closeButton);

    const dropdown = screen.getByTestId('dropdown-menu');
    expect(dropdown).toHaveAttribute('data-open', 'false');
  });
});

describe('PostMenuActions - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseIsMobile.mockReturnValue(false);
  });

  it('matches snapshot for desktop dropdown', () => {
    const trigger = <button>Menu</button>;
    const { container } = render(<PostMenuActions postId="pk:test123:post456" trigger={trigger} />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for mobile sheet', () => {
    mockUseIsMobile.mockReturnValue(true);
    const trigger = <button>Menu</button>;
    const { container } = render(<PostMenuActions postId="pk:test123:post456" trigger={trigger} />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });
});
