import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterContent, type ContentTab } from './FilterContent';
import { CONTENT } from '@/core/stores/filters/filters.types';

// Mock libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

describe('FilterContent', () => {
  it('renders with default selected tab', () => {
    render(<FilterContent />);

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByTestId('filter-root')).toMatchSnapshot();
  });

  it('renders with custom selected tab', () => {
    render(<FilterContent selectedTab={CONTENT.VIDEOS} />);

    const videosItem = screen.getByText('Videos').closest('[data-testid="filter-item"]');
    expect(videosItem).toMatchSnapshot();
  });

  it('calls onTabChange when tab is clicked', () => {
    const onTabChange = vi.fn();
    render(<FilterContent onTabChange={onTabChange} />);

    fireEvent.click(screen.getByText('Images'));
    expect(onTabChange).toHaveBeenCalledWith('images');
  });

  it('shows correct visual state for selected and unselected tabs', () => {
    render(<FilterContent selectedTab={CONTENT.POSTS} />);

    const postsItem = screen.getByText('Posts').closest('[data-testid="filter-item"]');
    const allItem = screen.getByText('All').closest('[data-testid="filter-item"]');

    expect(postsItem).toMatchSnapshot();
    expect(allItem).toMatchSnapshot();
  });

  it('handles all tab types correctly', () => {
    const onTabChange = vi.fn();
    render(<FilterContent onTabChange={onTabChange} />);

    const tabs: ContentTab[] = ['all', 'posts', 'articles', 'images', 'videos', 'links', 'files'];

    tabs.forEach((tab) => {
      const label =
        tab === 'all'
          ? 'All'
          : tab === 'posts'
            ? 'Posts'
            : tab === 'articles'
              ? 'Articles'
              : tab === 'images'
                ? 'Images'
                : tab === 'videos'
                  ? 'Videos'
                  : tab === 'links'
                    ? 'Links'
                    : 'Files';

      fireEvent.click(screen.getByText(label));
      expect(onTabChange).toHaveBeenCalledWith(tab);
    });
  });

  it('applies correct styling classes', () => {
    render(<FilterContent selectedTab={CONTENT.ALL} />);

    const allItem = screen.getByText('All').closest('[data-testid="filter-item"]');
    const postsItem = screen.getByText('Posts').closest('[data-testid="filter-item"]');

    expect(allItem).toMatchSnapshot();
    expect(postsItem).toMatchSnapshot();
  });

  it('renders with correct icons', () => {
    render(<FilterContent />);

    expect(screen.getByTestId('filter-list')).toMatchSnapshot();
  });

  it('applies correct icon classes', () => {
    render(<FilterContent />);

    expect(screen.getByTestId('filter-list')).toMatchSnapshot();
  });

  it('handles tab switching correctly', () => {
    const onTabChange = vi.fn();
    render(<FilterContent selectedTab={CONTENT.ALL} onTabChange={onTabChange} />);

    // Click on articles tab
    fireEvent.click(screen.getByText('Articles'));
    expect(onTabChange).toHaveBeenCalledWith('articles');
    expect(onTabChange).toHaveBeenCalledTimes(1);
  });

  it('rerenders with different selected tabs', () => {
    const { rerender } = render(<FilterContent selectedTab="all" />);

    let allItem = screen.getByText('All').closest('[data-testid="filter-item"]');
    const postsItem = screen.getByText('Posts').closest('[data-testid="filter-item"]');
    expect(allItem).toMatchSnapshot();
    expect(postsItem).toMatchSnapshot();

    // Rerender with different selected tab
    rerender(<FilterContent selectedTab="videos" />);
    allItem = screen.getByText('All').closest('[data-testid="filter-item"]');
    const videosItem2 = screen.getByText('Videos').closest('[data-testid="filter-item"]');
    expect(allItem).toMatchSnapshot();
    expect(videosItem2).toMatchSnapshot();
  });

  it('handles multiple tab clicks', () => {
    const onTabChange = vi.fn();
    render(<FilterContent onTabChange={onTabChange} />);

    fireEvent.click(screen.getByText('Images'));
    fireEvent.click(screen.getByText('Videos'));
    fireEvent.click(screen.getByText('Files'));

    expect(onTabChange).toHaveBeenCalledTimes(3);
    expect(onTabChange).toHaveBeenNthCalledWith(1, 'images');
    expect(onTabChange).toHaveBeenNthCalledWith(2, 'videos');
    expect(onTabChange).toHaveBeenNthCalledWith(3, 'files');
  });
});
