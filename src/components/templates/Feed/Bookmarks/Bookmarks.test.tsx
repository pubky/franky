import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Bookmarks } from './Bookmarks';

// Mock the atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  Heading: ({
    children,
    level,
    size,
    className,
  }: {
    children: React.ReactNode;
    level?: number;
    size?: string;
    className?: string;
  }) => (
    <h1 data-level={level} data-size={size} className={className}>
      {children}
    </h1>
  ),
  Button: ({
    children,
    variant,
    size,
    onClick,
    id,
    className,
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    onClick?: () => void;
    id?: string;
    className?: string;
  }) => (
    <button onClick={onClick} data-variant={variant} data-size={size} id={id} className={className}>
      {children}
    </button>
  ),
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <span data-size={size} className={className}>
      {children}
    </span>
  ),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  ContentLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="content-layout">{children}</div>,
}));

describe('Bookmarks', () => {
  it('renders without errors', () => {
    render(<Bookmarks />);
    expect(screen.getByText('Bookmarks')).toBeInTheDocument();
  });

  it('displays the Bookmarks heading correctly', () => {
    render(<Bookmarks />);
    const heading = screen.getByText('Bookmarks');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute('data-level', '1');
    expect(heading).toHaveAttribute('data-size', 'xl');
    expect(heading).toHaveClass('text-2xl');
  });

  it('displays description message', () => {
    render(<Bookmarks />);
    expect(screen.getByText('Access your saved posts and bookmarked content.')).toBeInTheDocument();
  });

  it('renders container structure correctly', () => {
    render(<Bookmarks />);
    expect(screen.getByTestId('content-layout')).toBeInTheDocument();
  });

  it('renders 3 content cards', () => {
    render(<Bookmarks />);
    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(3);
  });
});
