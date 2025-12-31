import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostPreviewCard } from './PostPreviewCard';

// Mock organisms
vi.mock('@/organisms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/organisms')>();
  return {
    ...actual,
    PostHeader: vi.fn(({ postId }: { postId: string }) => (
      <div data-testid="post-header" data-post-id={postId}>
        PostHeader {postId}
      </div>
    )),
    PostContentBase: vi.fn(({ postId }: { postId: string }) => (
      <div data-testid="post-content-base" data-post-id={postId}>
        PostContentBase {postId}
      </div>
    )),
  };
});

// Mock atoms
vi.mock('@/atoms', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

// Mock libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

describe('PostPreviewCard', () => {
  it('renders with required props', () => {
    render(<PostPreviewCard postId="test-post-123" />);

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByTestId('post-header')).toBeInTheDocument();
    expect(screen.getByTestId('post-content-base')).toBeInTheDocument();
  });

  it('applies CardContent classes', () => {
    render(<PostPreviewCard postId="test-post-123" />);
    const cardContent = screen.getByTestId('card-content');

    expect(cardContent).toHaveClass('flex flex-col gap-4 p-6');
  });

  it('applies default Card wrapper classes and merges className', () => {
    render(<PostPreviewCard postId="test-post-123" className="bg-muted" />);
    expect(screen.getByTestId('card')).toHaveClass('rounded-md py-0 bg-muted');
  });

  it('renders PostContentBase (prevents repost nesting)', () => {
    render(<PostPreviewCard postId="test-post-123" />);
    expect(screen.getByTestId('post-content-base')).toHaveAttribute('data-post-id', 'test-post-123');
  });
});

describe('PostPreviewCard - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<PostPreviewCard postId="snapshot-post-id" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with extra className', () => {
    const { container } = render(<PostPreviewCard postId="snapshot-post-id" className="bg-muted" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
