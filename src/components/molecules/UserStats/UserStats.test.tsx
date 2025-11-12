import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserStats } from './UserStats';

// Mock libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  };
});

// Mock atoms
vi.mock('@/atoms', () => ({
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <p data-testid="typography" data-size={size} data-class-name={className}>
      {children}
    </p>
  ),
}));

describe('UserStats', () => {
  it('renders tags and posts counts', () => {
    render(<UserStats tagsCount={761} postsCount={158} />);

    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('761')).toBeInTheDocument();
    expect(screen.getByText('posts')).toBeInTheDocument();
    expect(screen.getByText('158')).toBeInTheDocument();
  });

  it('renders with zero counts', () => {
    render(<UserStats tagsCount={0} postsCount={0} />);

    expect(screen.getByText('Tags')).toBeInTheDocument();
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(2); // One for tags, one for posts
    expect(screen.getByText('posts')).toBeInTheDocument();
  });

  it('renders with large counts', () => {
    render(<UserStats tagsCount={9999} postsCount={12345} />);

    expect(screen.getByText('9999')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<UserStats tagsCount={100} postsCount={50} className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with correct typography sizes', () => {
    render(<UserStats tagsCount={100} postsCount={50} />);

    const typographies = screen.getAllByTestId('typography');
    const labels = typographies.filter((t) => t.textContent === 'Tags' || t.textContent === 'posts');
    const values = typographies.filter((t) => t.textContent === '100' || t.textContent === '50');

    // Labels don't have size prop (using className for text-xs)
    labels.forEach((label) => {
      expect(label).not.toHaveAttribute('data-size');
    });

    values.forEach((value) => {
      expect(value).toHaveAttribute('data-size', 'sm');
    });
  });

  it('renders labels with correct styling classes', () => {
    render(<UserStats tagsCount={100} postsCount={50} />);

    const labels = screen
      .getAllByTestId('typography')
      .filter((t) => t.textContent === 'Tags' || t.textContent === 'posts');

    labels.forEach((label) => {
      const className = label.getAttribute('data-class-name') || '';
      expect(className).toContain('text-xs');
      expect(className).toContain('text-muted-foreground');
      expect(className).toContain('font-medium');
      expect(className).toContain('uppercase');
      expect(className).toContain('tracking-[1.2px]');
    });
  });

  it('renders values with correct styling classes', () => {
    render(<UserStats tagsCount={100} postsCount={50} />);

    const values = screen.getAllByTestId('typography').filter((t) => t.textContent === '100' || t.textContent === '50');

    values.forEach((value) => {
      const className = value.getAttribute('data-class-name') || '';
      expect(className).toContain('font-bold');
      expect(className).toContain('leading-5');
    });
  });
});

describe('UserStats - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<UserStats tagsCount={761} postsCount={158} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with zero counts', () => {
    const { container } = render(<UserStats tagsCount={0} postsCount={0} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<UserStats tagsCount={100} postsCount={50} className="custom-stats" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
