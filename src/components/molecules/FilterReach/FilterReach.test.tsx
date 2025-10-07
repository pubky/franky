import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterReach, type ReachTab } from './FilterReach';
import { REACH } from '@/core/stores/filters/filters.types';

// Mock libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

describe('FilterReach', () => {
  it('renders with default selected tab', () => {
    render(<FilterReach />);

    expect(screen.getByText('Reach')).toBeInTheDocument();
    expect(screen.getByTestId('filter-root')).toMatchSnapshot();
  });

  it('renders with custom selected tab', () => {
    render(<FilterReach selectedTab={REACH.FOLLOWING} />);

    const followingItem = screen.getByText('Following').closest('[data-testid="filter-item"]');
    expect(followingItem).toMatchSnapshot();
  });

  it('calls onTabChange when tab is clicked', () => {
    const mockOnTabChange = vi.fn();
    render(<FilterReach onTabChange={mockOnTabChange} />);

    const friendsElement = screen.getByText('Friends');
    fireEvent.click(friendsElement);

    expect(mockOnTabChange).toHaveBeenCalledWith('friends');
  });

  it('shows correct visual state for selected and unselected tabs', () => {
    render(<FilterReach selectedTab={REACH.ME} />);

    const meItem = screen.getByText('Me').closest('[data-testid="filter-item"]');
    const allItem = screen.getByText('All').closest('[data-testid="filter-item"]');

    expect(meItem).toMatchSnapshot();
    expect(allItem).toMatchSnapshot();
  });

  it('handles all tab types correctly', () => {
    const mockOnTabChange = vi.fn();
    render(<FilterReach onTabChange={mockOnTabChange} />);

    const tabs: ReachTab[] = ['all', 'following', 'friends', 'me'];

    tabs.forEach((tab) => {
      const element = screen.getByText(
        tab === 'all' ? 'All' : tab === 'following' ? 'Following' : tab === 'friends' ? 'Friends' : 'Me',
      );

      fireEvent.click(element);
      expect(mockOnTabChange).toHaveBeenCalledWith(tab);
    });
  });

  it('applies correct styling classes', () => {
    render(<FilterReach selectedTab={REACH.ALL} />);

    const allItem = screen.getByText('All').closest('[data-testid="filter-item"]');
    const followingItem = screen.getByText('Following').closest('[data-testid="filter-item"]');

    expect(allItem).toMatchSnapshot();
    expect(followingItem).toMatchSnapshot();
  });
});
