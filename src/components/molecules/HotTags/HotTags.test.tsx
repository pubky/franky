import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HotTags, type TagProps } from './HotTags';

const mockTags: TagProps[] = [
  { name: 'bitcoin', count: 16 },
  { name: 'keys', count: 176 },
  { name: 'pubky', count: 149 },
  { name: 'autonomy', count: 89 },
  { name: 'satoshi', count: 45 },
  { name: 'ethereum', count: 32 },
];

describe('HotTags', () => {
  it('renders the component with title', () => {
    render(<HotTags tags={mockTags} />);

    expect(screen.getByText('Hot Tags')).toBeInTheDocument();
  });

  it('renders up to 5 tags by default', () => {
    render(<HotTags tags={mockTags} />);

    expect(screen.getByText('bitcoin')).toBeInTheDocument();
    expect(screen.getByText('keys')).toBeInTheDocument();
    expect(screen.getByText('pubky')).toBeInTheDocument();
    expect(screen.getByText('autonomy')).toBeInTheDocument();
    expect(screen.getByText('satoshi')).toBeInTheDocument();
    expect(screen.queryByText('ethereum')).not.toBeInTheDocument();
  });

  it('renders custom max tags when specified', () => {
    render(<HotTags tags={mockTags} maxTags={3} />);

    expect(screen.getByText('bitcoin')).toBeInTheDocument();
    expect(screen.getByText('keys')).toBeInTheDocument();
    expect(screen.getByText('pubky')).toBeInTheDocument();
    expect(screen.queryByText('autonomy')).not.toBeInTheDocument();
    expect(screen.queryByText('satoshi')).not.toBeInTheDocument();
    expect(screen.queryByText('ethereum')).not.toBeInTheDocument();
  });

  it('shows "Explore all" button when there are more tags than maxTags', () => {
    render(<HotTags tags={mockTags} maxTags={3} />);

    expect(screen.getByTestId('see-all-button')).toBeInTheDocument();
    expect(screen.getByText('Explore all')).toBeInTheDocument();
  });

  it('does not show "See all" button when tags are less than or equal to maxTags', () => {
    render(<HotTags tags={mockTags.slice(0, 3)} maxTags={5} />);

    expect(screen.queryByTestId('see-all-button')).not.toBeInTheDocument();
  });

  it('calls onTagClick when tag is clicked', () => {
    const mockOnTagClick = vi.fn();
    render(<HotTags tags={mockTags} onTagClick={mockOnTagClick} />);

    const tag = screen.getByTestId('tag-0');
    fireEvent.click(tag);

    expect(mockOnTagClick).toHaveBeenCalledWith('bitcoin');
  });

  it('calls onSeeAll when "See all" button is clicked', () => {
    const mockOnSeeAll = vi.fn();
    render(<HotTags tags={mockTags} onSeeAll={mockOnSeeAll} />);

    const seeAllButton = screen.getByTestId('see-all-button');
    fireEvent.click(seeAllButton);

    expect(mockOnSeeAll).toHaveBeenCalled();
  });

  it('renders tags with counts', () => {
    render(<HotTags tags={mockTags} />);

    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('176')).toBeInTheDocument();
    expect(screen.getByText('149')).toBeInTheDocument();
  });

  it('renders tags without counts when count is not provided', () => {
    const tagsWithoutCounts: TagProps[] = [{ name: 'bitcoin' }, { name: 'ethereum' }];
    render(<HotTags tags={tagsWithoutCounts} />);

    expect(screen.getByText('bitcoin')).toBeInTheDocument();
    expect(screen.getByText('ethereum')).toBeInTheDocument();
  });

  it('handles empty tags array', () => {
    render(<HotTags tags={[]} />);

    expect(screen.getByText('Hot Tags')).toBeInTheDocument();
    expect(screen.queryByTestId('see-all-button')).not.toBeInTheDocument();
  });

  it('renders tags with correct data-testid', () => {
    render(<HotTags tags={mockTags} />);

    expect(screen.getByTestId('tag-0')).toBeInTheDocument();
    expect(screen.getByTestId('tag-1')).toBeInTheDocument();
    expect(screen.getByTestId('tag-2')).toBeInTheDocument();
  });
});
