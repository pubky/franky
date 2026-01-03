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
vi.mock('@/libs', async () => {
  const actual = await vi.importActual('@/libs');
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
