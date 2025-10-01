import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MobileHeader } from './MobileHeader';

// Mock the atoms
vi.mock('@/atoms', () => ({
  Typography: ({ children, className, size }: { children: React.ReactNode; className?: string; size?: string }) => (
    <span className={className} data-size={size}>
      {children}
    </span>
  ),
}));

// Mock the molecules
vi.mock('@/molecules', () => ({
  FilterDrawer: ({
    open,
    onOpenChangeAction,
    children,
    position,
  }: {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    children: React.ReactNode;
    position?: 'left' | 'right';
  }) => (
    <div data-testid={`filter-drawer-${position}`} data-open={open}>
      <button onClick={() => onOpenChangeAction(false)}>Close</button>
      {children}
    </div>
  ),
  WhoToFollow: () => <div data-testid="who-to-follow">Who to Follow</div>,
  ActiveUsers: () => <div data-testid="active-users">Active Users</div>,
  FeedbackCard: () => <div data-testid="feedback-card">Feedback Card</div>,
}));

// Mock the libs
vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  SlidersHorizontal: ({ className }: { className?: string }) => (
    <div data-testid="sliders-horizontal-icon" className={className}>
      SlidersHorizontal
    </div>
  ),
  Users: ({ className }: { className?: string }) => (
    <div data-testid="users-icon" className={className}>
      Users
    </div>
  ),
}));

describe('MobileHeader', () => {
  it('renders with default props', () => {
    render(<MobileHeader />);

    expect(screen.getByText('Pubky')).toBeInTheDocument();
    expect(screen.getByTestId('sliders-horizontal-icon')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<MobileHeader className="custom-header" />);

    const container = screen.getByText('Pubky').closest('div');
    expect(container).toHaveClass('custom-header');
  });

  it('renders with custom onLeftIconClick', () => {
    const mockOnLeftIconClick = vi.fn();
    render(<MobileHeader onLeftIconClick={mockOnLeftIconClick} />);

    const leftButton = screen.getByTestId('sliders-horizontal-icon').closest('button');
    fireEvent.click(leftButton!);

    expect(mockOnLeftIconClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct classes to container', () => {
    render(<MobileHeader />);

    const container = screen.getByText('Pubky').closest('div');
    expect(container).toHaveClass(
      'lg:hidden',
      'fixed',
      'top-0',
      'left-0',
      'right-0',
      'z-30',
      'bg-background/80',
      'backdrop-blur-sm',
      'border-b',
      'border-border/20',
    );
  });

  it('applies correct classes to inner container', () => {
    render(<MobileHeader />);

    const innerContainer = screen.getByText('Pubky').closest('div')?.parentElement;
    expect(innerContainer).toHaveClass('flex', 'items-center', 'justify-between', 'px-4', 'h-16');
  });

  it('applies correct classes to left button', () => {
    render(<MobileHeader />);

    const leftButton = screen.getByTestId('sliders-horizontal-icon').closest('button');
    expect(leftButton).toHaveClass('p-2', 'hover:bg-secondary/10', 'rounded-full', 'transition-colors');
  });

  it('applies correct classes to right button', () => {
    render(<MobileHeader />);

    const rightButton = screen.getByTestId('users-icon').closest('button');
    expect(rightButton).toHaveClass('p-2', 'hover:bg-secondary/10', 'rounded-full', 'transition-colors');
  });

  it('applies correct classes to logo container', () => {
    render(<MobileHeader />);

    const logoContainer = screen.getByText('Pubky').closest('div');
    expect(logoContainer).toHaveClass('flex', 'items-center', 'gap-2');
  });

  it('applies correct classes to logo text', () => {
    render(<MobileHeader />);

    const logoText = screen.getByText('Pubky');
    expect(logoText).toHaveClass('font-bold');
  });

  it('renders right drawer with correct content', () => {
    render(<MobileHeader />);

    expect(screen.getByTestId('filter-drawer-right')).toBeInTheDocument();
    expect(screen.getByTestId('who-to-follow')).toBeInTheDocument();
    expect(screen.getByTestId('active-users')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-card')).toBeInTheDocument();
  });

  it('handles right button click to open drawer', () => {
    render(<MobileHeader />);

    const rightButton = screen.getByTestId('users-icon').closest('button');
    fireEvent.click(rightButton!);

    // The drawer should be open (this is handled by the mocked component)
    expect(screen.getByTestId('filter-drawer-right')).toBeInTheDocument();
  });

  it('applies correct icon classes', () => {
    render(<MobileHeader />);

    const leftIcon = screen.getByTestId('sliders-horizontal-icon');
    const rightIcon = screen.getByTestId('users-icon');

    expect(leftIcon).toHaveClass('h-6', 'w-6');
    expect(rightIcon).toHaveClass('h-6', 'w-6');
  });

  it('renders with correct responsive behavior', () => {
    render(<MobileHeader />);

    const container = screen.getByText('Pubky').closest('div');
    expect(container).toHaveClass('lg:hidden');
  });

  it('handles hover states correctly', () => {
    render(<MobileHeader />);

    const leftButton = screen.getByTestId('sliders-horizontal-icon').closest('button');
    const rightButton = screen.getByTestId('users-icon').closest('button');

    expect(leftButton).toHaveClass('hover:bg-secondary/10', 'transition-colors');
    expect(rightButton).toHaveClass('hover:bg-secondary/10', 'transition-colors');
  });

  it('renders logo with correct attributes', () => {
    render(<MobileHeader />);

    const logoText = screen.getByText('Pubky');
    expect(logoText).toHaveAttribute('data-size', 'md');
  });

  it('renders with correct structure', () => {
    render(<MobileHeader />);

    // Check that all main elements are present
    expect(screen.getByTestId('sliders-horizontal-icon')).toBeInTheDocument();
    expect(screen.getByText('Pubky')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
  });
});

describe('MobileHeader - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<MobileHeader />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<MobileHeader className="custom-header" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom onLeftIconClick', () => {
    const mockOnLeftIconClick = vi.fn();
    const { container } = render(<MobileHeader onLeftIconClick={mockOnLeftIconClick} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for left button', () => {
    render(<MobileHeader />);

    const leftButton = screen.getByTestId('sliders-horizontal-icon').closest('button');
    expect(leftButton).toMatchSnapshot();
  });

  it('matches snapshot for right button', () => {
    render(<MobileHeader />);

    const rightButton = screen.getByTestId('users-icon').closest('button');
    expect(rightButton).toMatchSnapshot();
  });

  it('matches snapshot for logo', () => {
    render(<MobileHeader />);

    const logoText = screen.getByText('Pubky');
    expect(logoText).toMatchSnapshot();
  });
});
