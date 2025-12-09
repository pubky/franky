import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostPreviewCard } from './PostPreviewCard';

// Mock organisms
vi.mock('@/organisms', () => ({
  PostHeader: vi.fn(({ postId }: { postId: string }) => (
    <div data-testid="post-header" data-post-id={postId}>
      PostHeader {postId}
    </div>
  )),
  PostContent: vi.fn(({ postId }: { postId: string }) => (
    <div data-testid="post-content" data-post-id={postId}>
      PostContent {postId}
    </div>
  )),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

// Mock libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  };
});

describe('PostPreviewCard', () => {
  it('renders with required props', () => {
    render(<PostPreviewCard postId="test-post-123" />);

    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByTestId('post-header')).toBeInTheDocument();
    expect(screen.getByTestId('post-content')).toBeInTheDocument();
  });

  it('applies CardContent classes', () => {
    render(<PostPreviewCard postId="test-post-123" />);
    const cardContent = screen.getByTestId('card-content');

    expect(cardContent).toHaveClass('flex flex-col gap-4 p-6');
  });

  it('renders children when provided', () => {
    render(
      <PostPreviewCard postId="test-post-123">
        <div data-testid="footer">Footer content</div>
      </PostPreviewCard>,
    );

    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toHaveTextContent('Footer content');
  });

  it('does not render children when not provided', () => {
    render(<PostPreviewCard postId="test-post-123" />);

    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });
});

describe('PostPreviewCard - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<PostPreviewCard postId="snapshot-post-id" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with children', () => {
    const { container } = render(
      <PostPreviewCard postId="snapshot-post-id">
        <div>Footer content</div>
      </PostPreviewCard>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
