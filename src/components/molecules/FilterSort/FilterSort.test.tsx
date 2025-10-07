import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterSort, type SortTab } from './FilterSort';
import { SORT } from '@/core/stores/filters/filters.types';

// Mock libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

describe('FilterSort', () => {
  it('renders with default selected tab', () => {
    render(<FilterSort />);

    expect(screen.getByText('Sort')).toBeInTheDocument();
    expect(screen.getByTestId('filter-root')).toMatchSnapshot();
  });

  it('renders with custom selected tab', () => {
    render(<FilterSort selectedTab={SORT.POPULARITY} />);

    const popularityItem = screen.getByText('Popularity').closest('[data-testid="filter-item"]');
    expect(popularityItem).toMatchSnapshot();
  });

  it('calls onTabChange when tab is clicked', () => {
    const mockOnTabChange = vi.fn();
    render(<FilterSort onTabChange={mockOnTabChange} />);

    const popularityElement = screen.getByText('Popularity');
    fireEvent.click(popularityElement);

    expect(mockOnTabChange).toHaveBeenCalledWith('popularity');
  });

  it('shows correct visual state for selected and unselected tabs', () => {
    render(<FilterSort selectedTab={SORT.RECENT} />);

    const recentItem = screen.getByText('Recent').closest('[data-testid="filter-item"]');
    const popularityItem2 = screen.getByText('Popularity').closest('[data-testid="filter-item"]');

    expect(recentItem).toMatchSnapshot();
    expect(popularityItem2).toMatchSnapshot();
  });

  it('handles all tab types correctly', () => {
    const mockOnTabChange = vi.fn();
    render(<FilterSort onTabChange={mockOnTabChange} />);

    const tabs: SortTab[] = ['recent', 'popularity'];

    tabs.forEach((tab) => {
      const element = screen.getByText(tab === 'recent' ? 'Recent' : 'Popularity');

      fireEvent.click(element);
      expect(mockOnTabChange).toHaveBeenCalledWith(tab);
    });
  });

  it('applies correct styling classes', () => {
    render(<FilterSort selectedTab={SORT.RECENT} />);

    const recentItem = screen.getByText('Recent').closest('[data-testid="filter-item"]');
    const popularityItem = screen.getByText('Popularity').closest('[data-testid="filter-item"]');

    expect(recentItem).toMatchSnapshot();
    expect(popularityItem).toMatchSnapshot();
  });

  it('renders with correct icons', () => {
    render(<FilterSort />);

    expect(screen.getByTestId('filter-list')).toMatchSnapshot();
  });

  it('applies correct icon classes', () => {
    render(<FilterSort />);

    expect(screen.getByTestId('filter-list')).toMatchSnapshot();
  });

  it('handles tab switching correctly', () => {
    const mockOnTabChange = vi.fn();
    render(<FilterSort selectedTab={SORT.RECENT} onTabChange={mockOnTabChange} />);

    // Click on popularity tab
    const popularityElement = screen.getByText('Popularity');
    fireEvent.click(popularityElement);

    expect(mockOnTabChange).toHaveBeenCalledWith('popularity');
    expect(mockOnTabChange).toHaveBeenCalledTimes(1);
  });

  it('renders with different selected tabs', () => {
    const { rerender } = render(<FilterSort selectedTab="recent" />);

    let recentItem = screen.getByText('Recent').closest('[data-testid="filter-item"]');
    let popularityItem = screen.getByText('Popularity').closest('[data-testid="filter-item"]');

    expect(recentItem).toMatchSnapshot();
    expect(popularityItem).toMatchSnapshot();

    // Rerender with different selected tab
    rerender(<FilterSort selectedTab="popularity" />);

    recentItem = screen.getByText('Recent').closest('[data-testid="filter-item"]');
    popularityItem = screen.getByText('Popularity').closest('[data-testid="filter-item"]');

    expect(recentItem).toMatchSnapshot();
    expect(popularityItem).toMatchSnapshot();
  });
});
