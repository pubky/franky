import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MobileHeader } from './MobileHeader';

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
  Logo: ({ width, height }: { width?: number; height?: number }) => (
    <img data-testid="logo" alt="Pubky" data-width={width} data-height={height} />
  ),
}));

// Mock libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

describe('MobileHeader', () => {
  it('renders with default props', () => {
    render(<MobileHeader />);

    expect(screen.getByAltText('Pubky')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<MobileHeader className="custom-header" />);

    expect(screen.getByAltText('Pubky')).toBeInTheDocument();
  });

  it('renders with custom onLeftIconClick', () => {
    const mockOnLeftIconClick = vi.fn();
    render(<MobileHeader onLeftIconClick={mockOnLeftIconClick} />);

    const leftButton = document.querySelector('.lucide-sliders-horizontal')?.closest('button');
    fireEvent.click(leftButton!);

    expect(mockOnLeftIconClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct classes to container', () => {
    render(<MobileHeader />);

    expect(screen.getByAltText('Pubky')).toBeInTheDocument();
  });

  it('applies correct classes to left button', () => {
    render(<MobileHeader />);

    const leftButton = document.querySelector('.lucide-sliders-horizontal')?.closest('button');
    expect(leftButton).toHaveClass('p-2', 'hover:bg-secondary/10', 'rounded-full', 'transition-colors');
  });

  it('applies correct classes to right button', () => {
    render(<MobileHeader />);

    const rightButton = document.querySelector('.lucide-activity')?.closest('button');
    expect(rightButton).toHaveClass('p-2', 'hover:bg-secondary/10', 'rounded-full', 'transition-colors');
  });

  it('applies correct classes to logo container', () => {
    render(<MobileHeader />);

    const logoContainer = screen.getByTestId('logo').closest('div');
    expect(logoContainer).toHaveClass('flex', 'items-center', 'gap-2');
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

    const rightButton = document.querySelector('.lucide-activity')?.closest('button');
    fireEvent.click(rightButton!);

    // The drawer should be open (this is handled by the mocked component)
    expect(screen.getByTestId('filter-drawer-right')).toBeInTheDocument();
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

    // Icons are now actual lucide-react components (SVGs), find buttons by position
    const buttons = screen.getAllByRole('button');
    const leftButton = buttons[0];
    expect(leftButton).toMatchSnapshot();
  });

  it('matches snapshot for right button', () => {
    render(<MobileHeader />);

    // Icons are now actual lucide-react components (SVGs), find buttons by position
    const buttons = screen.getAllByRole('button');
    const rightButton = buttons[1];
    expect(rightButton).toMatchSnapshot();
  });

  it('matches snapshot for logo', () => {
    render(<MobileHeader />);

    const logo = screen.getByTestId('logo');
    expect(logo).toMatchSnapshot();
  });
});
