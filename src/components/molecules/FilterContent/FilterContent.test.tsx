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
  });

  it('calls onTabChange when tab is clicked', () => {
    const onTabChange = vi.fn();
    render(<FilterContent onTabChange={onTabChange} />);

    fireEvent.click(screen.getByText('Images'));
    expect(onTabChange).toHaveBeenCalledWith('images');
  });

  it('handles all tab types correctly', () => {
    const onTabChange = vi.fn();
    render(<FilterContent onTabChange={onTabChange} />);

    const tabs: ContentTab[] = ['all', 'posts', 'articles', 'images', 'videos', 'links', 'files'];

    tabs.forEach((tab) => {
      // capitalize first letter
      const label = tab.charAt(0).toUpperCase() + tab.slice(1);
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

describe('FilterContent - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<FilterContent />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with All content selected tab', () => {
    const { container } = render(<FilterContent selectedTab={CONTENT.ALL} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with Posts content selected tab', () => {
    const { container } = render(<FilterContent selectedTab={CONTENT.POSTS} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with Articles content selected tab', () => {
    const { container } = render(<FilterContent selectedTab={CONTENT.ARTICLES} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with Images content selected tab', () => {
    const { container } = render(<FilterContent selectedTab={CONTENT.IMAGES} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with Videos content selected tab', () => {
    const { container } = render(<FilterContent selectedTab={CONTENT.VIDEOS} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with Links content selected tab', () => {
    const { container } = render(<FilterContent selectedTab={CONTENT.LINKS} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with Files content selected tab', () => {
    const { container } = render(<FilterContent selectedTab={CONTENT.FILES} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
