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
  });

  it('calls onTabChange when tab is clicked', () => {
    const mockOnTabChange = vi.fn();
    render(<FilterSort onTabChange={mockOnTabChange} />);

    const popularityElement = screen.getByText('Popularity');
    fireEvent.click(popularityElement);

    expect(mockOnTabChange).toHaveBeenCalledWith('popularity');
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

    expect(recentItem).toBeInTheDocument();
    expect(popularityItem).toBeInTheDocument();

    // Rerender with different selected tab
    rerender(<FilterSort selectedTab="popularity" />);

    recentItem = screen.getByText('Recent').closest('[data-testid="filter-item"]');
    popularityItem = screen.getByText('Popularity').closest('[data-testid="filter-item"]');

    expect(recentItem).toBeInTheDocument();
    expect(popularityItem).toBeInTheDocument();
  });
});

describe('FilterSort - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<FilterSort />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with Recent content selected tab', () => {
    const { container } = render(<FilterSort selectedTab={SORT.RECENT} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with Popularity content selected tab', () => {
    const { container } = render(<FilterSort selectedTab={SORT.POPULARITY} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
