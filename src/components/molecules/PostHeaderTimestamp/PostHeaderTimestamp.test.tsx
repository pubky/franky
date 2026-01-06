import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostHeaderTimestamp } from './PostHeaderTimestamp';

vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    overrideDefaults,
  }: {
    children: React.ReactNode;
    className?: string;
    overrideDefaults?: boolean;
  }) => (
    <div data-testid="container" className={className} data-override-defaults={overrideDefaults}>
      {children}
    </div>
  ),
  Typography: ({
    children,
    as: Tag = 'p',
    className,
  }: {
    children: React.ReactNode;
    as?: React.ElementType;
    className?: string;
  }) => (
    <Tag data-testid="typography" className={className}>
      {children}
    </Tag>
  ),
}));

vi.mock('@/libs', () => ({
  Clock: vi.fn(({ className }: { className?: string }) => <svg data-testid="clock-icon" className={className} />),
}));

describe('PostHeaderTimestamp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders timeAgo text', () => {
    render(<PostHeaderTimestamp timeAgo="2h" />);

    expect(screen.getByText('2h')).toBeInTheDocument();
  });

  it('renders clock icon', () => {
    render(<PostHeaderTimestamp timeAgo="2h" />);

    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<PostHeaderTimestamp timeAgo="5m" />);

    const clockIcon = screen.getByTestId('clock-icon');
    expect(clockIcon).toHaveClass('size-4', 'text-muted-foreground');
  });

  it('renders different timeAgo values', () => {
    const { rerender } = render(<PostHeaderTimestamp timeAgo="1m" />);
    expect(screen.getByText('1m')).toBeInTheDocument();

    rerender(<PostHeaderTimestamp timeAgo="3d" />);
    expect(screen.getByText('3d')).toBeInTheDocument();

    rerender(<PostHeaderTimestamp timeAgo="just now" />);
    expect(screen.getByText('just now')).toBeInTheDocument();
  });
});

describe('PostHeaderTimestamp - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot with hours', () => {
    const { container } = render(<PostHeaderTimestamp timeAgo="2h" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with minutes', () => {
    const { container } = render(<PostHeaderTimestamp timeAgo="5m" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with days', () => {
    const { container } = render(<PostHeaderTimestamp timeAgo="3d" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with "just now"', () => {
    const { container } = render(<PostHeaderTimestamp timeAgo="just now" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
