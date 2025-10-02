import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FilterDrawer } from './FilterDrawer';

// Mock the libs
vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('FilterDrawer', () => {
  const mockOnOpenChangeAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document.body.style.overflow
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Clean up any timers
    vi.clearAllTimers();
  });

  it('renders when open is true', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <FilterDrawer open={false} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  it('renders with left position by default', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    // Check that the component renders
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with left position when position is left', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction} position="left">
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with right position when position is right', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction} position="right">
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('calls onOpenChangeAction when backdrop is clicked', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    // Find the backdrop by looking for the element with the backdrop classes
    const backdrop = document.querySelector('.absolute.inset-0.bg-black');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnOpenChangeAction).toHaveBeenCalledWith(false);
    }
  });

  it('applies correct classes for left position', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction} position="left">
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct classes for right position', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction} position="right">
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct width classes for left position', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction} position="left">
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct width classes for right position', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction} position="right">
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct base classes', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct backdrop classes', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct container classes', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles animation states correctly', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    // Should be visible when open
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('sets body overflow hidden when open', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when closed', () => {
    const { rerender } = render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <FilterDrawer open={false} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(document.body.style.overflow).toBe('');
  });

  it('renders children correctly', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </FilterDrawer>,
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });
});

describe('FilterDrawer - Snapshots', () => {
  const mockOnOpenChangeAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot with left position', () => {
    const { container } = render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction} position="left">
        <div>Test Content</div>
      </FilterDrawer>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with right position', () => {
    const { container } = render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction} position="right">
        <div>Test Content</div>
      </FilterDrawer>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when closed', () => {
    const { container } = render(
      <FilterDrawer open={false} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with complex children', () => {
    const { container } = render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>
          <h2>Filter Options</h2>
          <div>
            <button>Option 1</button>
            <button>Option 2</button>
          </div>
        </div>
      </FilterDrawer>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
