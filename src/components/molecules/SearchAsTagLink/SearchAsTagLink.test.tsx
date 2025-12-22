import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchAsTagLink } from './SearchAsTagLink';

vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    onClick,
    ...props
  }: React.PropsWithChildren<{ className?: string; onClick?: () => void }>) => (
    <div className={className} onClick={onClick} {...props}>
      {children}
    </div>
  ),
  Typography: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
    <span className={className} {...props}>
      {children}
    </span>
  ),
}));

vi.mock('@/libs', () => ({
  Search: ({ className }: { className?: string }) => <svg data-testid="search-icon" className={className} />,
}));

describe('SearchAsTagLink', () => {
  it('renders query text', () => {
    render(<SearchAsTagLink query="technology" onClick={vi.fn()} />);

    expect(screen.getByText("'technology'")).toBeInTheDocument();
    expect(screen.getByText(/Search/)).toBeInTheDocument();
    expect(screen.getByText(/as tag/)).toBeInTheDocument();
  });

  it('renders search icon', () => {
    render(<SearchAsTagLink query="technology" onClick={vi.fn()} />);

    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('calls onClick with trimmed query when clicked', () => {
    const onClick = vi.fn();
    render(<SearchAsTagLink query="  technology  " onClick={onClick} />);

    fireEvent.click(screen.getByTestId('search-as-tag-link'));

    expect(onClick).toHaveBeenCalledWith('technology');
  });

  it('returns null when query is empty', () => {
    const { container } = render(<SearchAsTagLink query="" onClick={vi.fn()} />);

    expect(container.firstChild).toBeNull();
  });

  it('returns null when query is only whitespace', () => {
    const { container } = render(<SearchAsTagLink query="   " onClick={vi.fn()} />);

    expect(container.firstChild).toBeNull();
  });

  it('trims query for display', () => {
    render(<SearchAsTagLink query="  tech  " onClick={vi.fn()} />);

    expect(screen.getByText("'tech'")).toBeInTheDocument();
  });

  describe('Snapshots', () => {
    it('matches snapshot with query', () => {
      const { container } = render(<SearchAsTagLink query="technology" onClick={vi.fn()} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with whitespace query (null)', () => {
      const { container } = render(<SearchAsTagLink query="  " onClick={vi.fn()} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
