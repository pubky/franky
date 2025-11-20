import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterLayout } from './FilterLayout';
import { LAYOUT, type LayoutType } from '@/core/stores/home/home.types';
import { normaliseRadixIds } from '@/libs/utils/utils';

// Mock libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

describe('FilterLayout', () => {
  it('renders with default selected tab', () => {
    render(<FilterLayout />);

    expect(screen.getByText('Layout')).toBeInTheDocument();
  });

  it('calls onTabChange when tab is clicked', () => {
    const onTabChange = vi.fn();
    render(<FilterLayout onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText('Wide'));
    expect(onTabChange).toHaveBeenCalledWith('wide');
  });

  it('does not call onTabChange when tab is clicked and is disabled', () => {
    const onTabChange = vi.fn();
    render(<FilterLayout onTabChange={onTabChange} />);

    // Visual tab is disabled, so clicking it shouldn't trigger onTabChange
    fireEvent.click(screen.getByText('Visual'));
    expect(onTabChange).not.toHaveBeenCalled();
  });

  it('handles all tab types correctly', () => {
    const onTabChange = vi.fn();
    render(<FilterLayout onTabChange={onTabChange} />);

    // Test only enabled tabs (Visual is disabled)
    ([LAYOUT.COLUMNS, LAYOUT.WIDE] as LayoutType[]).forEach((tab) => {
      const label = tab === LAYOUT.COLUMNS ? 'Columns' : 'Wide';
      fireEvent.click(screen.getByText(label));
      expect(onTabChange).toHaveBeenCalledWith(tab);
    });

    // Verify Visual tab exists but clicking it doesn't trigger callback (disabled)
    const visualElement = screen.getByText('Visual');
    expect(visualElement).toBeInTheDocument();
    const callCountBefore = onTabChange.mock.calls.length;
    fireEvent.click(visualElement);
    expect(onTabChange.mock.calls.length).toBe(callCountBefore); // Should not increase
  });

  it('rerenders with different selected tabs', () => {
    const { rerender } = render(<FilterLayout selectedTab={LAYOUT.COLUMNS} />);

    let columnsItem = screen.getByText('Columns').closest('[data-testid="filter-item"]');
    const wideItem3 = screen.getByText('Wide').closest('[data-testid="filter-item"]');
    expect(columnsItem).toBeInTheDocument();
    expect(wideItem3).toBeInTheDocument();

    rerender(<FilterLayout selectedTab={LAYOUT.VISUAL} />);
    columnsItem = screen.getByText('Columns').closest('[data-testid="filter-item"]');
    const visualItem = screen.getByText('Visual').closest('[data-testid="filter-item"]');
    expect(columnsItem).toBeInTheDocument();
    expect(visualItem).toBeInTheDocument();
  });
});

describe('FilterLayout - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<FilterLayout />);
    const normalisedContainer = normaliseRadixIds(container);
    expect(normalisedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with Columns selected tab', () => {
    const { container } = render(<FilterLayout selectedTab={LAYOUT.COLUMNS} />);
    const normalisedContainer = normaliseRadixIds(container);
    expect(normalisedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with Wide selected tab', () => {
    const { container } = render(<FilterLayout selectedTab={LAYOUT.WIDE} />);
    const normalisedContainer = normaliseRadixIds(container);
    expect(normalisedContainer.firstChild).toMatchSnapshot();
  });
});
