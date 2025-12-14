import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostMenuActions } from './PostMenuActions';
import { normaliseRadixIds } from '@/libs/utils/utils';

// Mock state
let mockIsMobile = false;

vi.mock('@/hooks', () => ({
  useIsMobile: () => mockIsMobile,
}));

// Mock PostMenuActionsContent
vi.mock('./PostMenuActionsContent', () => ({
  PostMenuActionsContent: ({ postId, variant }: { postId: string; variant: string }) => (
    <div data-testid="post-menu-actions-content" data-post-id={postId} data-variant={variant}>
      Menu Content
    </div>
  ),
}));

interface MockDropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface MockDropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface MockDropdownMenuContentProps {
  children: React.ReactNode;
}

interface MockSheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface MockSheetTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface MockSheetContentProps {
  children: React.ReactNode;
  side?: string;
}

interface MockSheetHeaderProps {
  children: React.ReactNode;
}

interface MockSheetTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface MockSheetDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface MockContainerProps {
  children: React.ReactNode;
  className?: string;
  overrideDefaults?: boolean;
}

// Mock atoms
vi.mock('@/atoms', () => ({
  DropdownMenu: ({ children, open, onOpenChange }: MockDropdownMenuProps) => (
    <div data-testid="dropdown-menu" data-open={open} data-on-open-change={onOpenChange ? 'true' : 'false'}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children, asChild }: MockDropdownMenuTriggerProps) => (
    <div data-testid="dropdown-menu-trigger" data-as-child={asChild ? 'true' : 'false'}>
      {children}
    </div>
  ),
  DropdownMenuContent: ({ children }: MockDropdownMenuContentProps) => (
    <div data-testid="dropdown-menu-content">{children}</div>
  ),
  Sheet: ({ children, open, onOpenChange }: MockSheetProps) => (
    <div data-testid="sheet" data-open={open} data-on-open-change={onOpenChange ? 'true' : 'false'}>
      {children}
    </div>
  ),
  SheetTrigger: ({ children, asChild }: MockSheetTriggerProps) => (
    <div data-testid="sheet-trigger" data-as-child={asChild ? 'true' : 'false'}>
      {children}
    </div>
  ),
  SheetContent: ({ children, side }: MockSheetContentProps) => (
    <div data-testid="sheet-content" data-side={side}>
      {children}
    </div>
  ),
  SheetHeader: ({ children }: MockSheetHeaderProps) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children, className }: MockSheetTitleProps) => (
    <div data-testid="sheet-title" data-class-name={className}>
      {children}
    </div>
  ),
  SheetDescription: ({ children, className }: MockSheetDescriptionProps) => (
    <div data-testid="sheet-description" data-class-name={className}>
      {children}
    </div>
  ),
  Container: ({ children, className, overrideDefaults }: MockContainerProps) => (
    <div
      data-testid="container"
      data-class-name={className}
      data-override-defaults={overrideDefaults ? 'true' : 'false'}
    >
      {children}
    </div>
  ),
}));

describe('PostMenuActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMobile = false;
  });

  it('renders dropdown menu on desktop', () => {
    mockIsMobile = false;

    const trigger = <button>More</button>;
    render(<PostMenuActions postId="pk:test123:post456" trigger={trigger} />);

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.queryByTestId('sheet')).not.toBeInTheDocument();
  });

  it('renders sheet on mobile', () => {
    mockIsMobile = true;

    const trigger = <button>More</button>;
    render(<PostMenuActions postId="pk:test123:post456" trigger={trigger} />);

    expect(screen.getByTestId('sheet')).toBeInTheDocument();
    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
  });

  it('passes correct variant to content component', () => {
    mockIsMobile = false;

    const trigger = <button>More</button>;
    render(<PostMenuActions postId="pk:test123:post456" trigger={trigger} />);

    expect(screen.getByTestId('post-menu-actions-content')).toHaveAttribute('data-variant', 'dropdown');
  });

  it('passes sheet variant on mobile', () => {
    mockIsMobile = true;

    const trigger = <button>More</button>;
    render(<PostMenuActions postId="pk:test123:post456" trigger={trigger} />);

    expect(screen.getByTestId('post-menu-actions-content')).toHaveAttribute('data-variant', 'sheet');
  });
});

describe('PostMenuActions - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMobile = false;
  });

  it('matches snapshot for desktop dropdown state', () => {
    mockIsMobile = false;

    const trigger = <button>More</button>;
    const { container } = render(<PostMenuActions postId="pk:test123:post456" trigger={trigger} />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for mobile sheet state', () => {
    mockIsMobile = true;

    const trigger = <button>More</button>;
    const { container } = render(<PostMenuActions postId="pk:test123:post456" trigger={trigger} />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });
});
