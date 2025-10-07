import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterLayout, type LayoutTab } from './FilterLayout';
import { LAYOUT } from '@/core/stores/filters/filters.types';

// Mock libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

describe('FilterLayout', () => {
  it('renders with default selected tab', () => {
    render(<FilterLayout />);

    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.getByTestId('filter-root')).toMatchSnapshot();
  });

  it('renders with custom selected tab', () => {
    render(<FilterLayout selectedTab={LAYOUT.WIDE} />);

    const wideItem = screen.getByText('Wide').closest('[data-testid="filter-item"]');
    expect(wideItem).toMatchSnapshot();
  });

  it('calls onTabChange when tab is clicked', () => {
    const onTabChange = vi.fn();
    render(<FilterLayout onTabChange={onTabChange} />);

    // Visual tab is disabled, so clicking it shouldn't trigger onTabChange
    fireEvent.click(screen.getByText('Visual'));
    expect(onTabChange).not.toHaveBeenCalled();
  });

  it('shows correct visual state for selected and unselected tabs', () => {
    render(<FilterLayout selectedTab={LAYOUT.COLUMNS} />);

    const columnsItem = screen.getByText('Columns').closest('[data-testid="filter-item"]');
    const wideItem2 = screen.getByText('Wide').closest('[data-testid="filter-item"]');

    expect(columnsItem).toMatchSnapshot();
    expect(wideItem2).toMatchSnapshot();
  });

  it('handles all tab types correctly', () => {
    const onTabChange = vi.fn();
    render(<FilterLayout onTabChange={onTabChange} />);

    // Test only enabled tabs (Visual is disabled)
    ([LAYOUT.COLUMNS, LAYOUT.WIDE] as LayoutTab[]).forEach((tab) => {
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

  it('applies correct styling classes', () => {
    render(<FilterLayout selectedTab={LAYOUT.COLUMNS} />);

    const columnsItem = screen.getByText('Columns').closest('[data-testid="filter-item"]');
    const wideItem = screen.getByText('Wide').closest('[data-testid="filter-item"]');

    expect(columnsItem).toMatchSnapshot();
    expect(wideItem).toMatchSnapshot();
  });

  it('renders with correct icons', () => {
    render(<FilterLayout />);

    expect(screen.getByTestId('filter-list')).toMatchSnapshot();
  });

  it('applies correct icon classes', () => {
    render(<FilterLayout />);

    expect(screen.getByTestId('filter-list')).toMatchSnapshot();
  });

  it('rerenders with different selected tabs', () => {
    const { rerender } = render(<FilterLayout selectedTab={LAYOUT.COLUMNS} />);

    let columnsItem = screen.getByText('Columns').closest('[data-testid="filter-item"]');
    const wideItem3 = screen.getByText('Wide').closest('[data-testid="filter-item"]');
    expect(columnsItem).toMatchSnapshot();
    expect(wideItem3).toMatchSnapshot();

    rerender(<FilterLayout selectedTab={LAYOUT.VISUAL} />);
    columnsItem = screen.getByText('Columns').closest('[data-testid="filter-item"]');
    const visualItem = screen.getByText('Visual').closest('[data-testid="filter-item"]');
    expect(columnsItem).toMatchSnapshot();
    expect(visualItem).toMatchSnapshot();
  });
});
