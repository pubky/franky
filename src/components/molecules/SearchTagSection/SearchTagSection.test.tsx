import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchTagSection } from './SearchTagSection';

vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    overrideDefaults,
    ...props
  }: React.PropsWithChildren<{ className?: string; overrideDefaults?: boolean }>) => (
    <div data-testid="container" className={className} data-override-defaults={overrideDefaults} {...props}>
      {children}
    </div>
  ),
  Typography: ({ children, className, size }: React.PropsWithChildren<{ className?: string; size?: string }>) => (
    <span data-testid="typography" className={className} data-size={size}>
      {children}
    </span>
  ),
}));

vi.mock('@/molecules', () => ({
  PostTag: ({ label, color, onClick }: { label: string; color?: string; onClick?: () => void }) => (
    <button data-testid={`tag-${label}`} data-color={color} onClick={onClick}>
      {label}
    </button>
  ),
}));

describe('SearchTagSection', () => {
  const mockTags = [
    { label: 'bitcoin', color: '#FF8C00' },
    { label: 'satoshi', color: '#FF0000' },
  ];

  it('renders title and tags', () => {
    const onTagClick = vi.fn();
    render(<SearchTagSection title="Recent searches" tags={mockTags} onTagClick={onTagClick} />);

    expect(screen.getByText('Recent searches')).toBeInTheDocument();
    expect(screen.getByTestId('tag-bitcoin')).toBeInTheDocument();
    expect(screen.getByTestId('tag-satoshi')).toBeInTheDocument();
  });

  it('returns null when tags array is empty', () => {
    const onTagClick = vi.fn();
    const { container } = render(<SearchTagSection title="Empty" tags={[]} onTagClick={onTagClick} />);

    expect(container.firstChild).toBeNull();
  });

  it('calls onTagClick when tag is clicked', () => {
    const onTagClick = vi.fn();
    render(<SearchTagSection title="Test" tags={mockTags} onTagClick={onTagClick} />);

    fireEvent.click(screen.getByTestId('tag-bitcoin'));

    expect(onTagClick).toHaveBeenCalledWith('bitcoin');
  });

  it('passes color to PostTag', () => {
    const onTagClick = vi.fn();
    render(<SearchTagSection title="Test" tags={mockTags} onTagClick={onTagClick} />);

    expect(screen.getByTestId('tag-bitcoin')).toHaveAttribute('data-color', '#FF8C00');
  });

  describe('Snapshots', () => {
    it('matches snapshot with tags', () => {
      const onTagClick = vi.fn();
      const { container } = render(
        <SearchTagSection title="Recent searches" tags={mockTags} onTagClick={onTagClick} />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot when empty', () => {
      const onTagClick = vi.fn();
      const { container } = render(<SearchTagSection title="Empty" tags={[]} onTagClick={onTagClick} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
