import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DialogPostPreview } from './DialogPostPreview';

vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

vi.mock('@/atoms', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" data-class-name={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" data-class-name={className}>
      {children}
    </div>
  ),
}));

vi.mock('@/organisms', () => ({
  PostHeader: ({ postId }: { postId: string }) => <div data-testid="post-header">PostHeader {postId}</div>,
  PostContent: ({ postId }: { postId: string }) => <div data-testid="post-content">PostContent {postId}</div>,
}));

describe('DialogPostPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with required postId prop', () => {
    render(<DialogPostPreview postId="test-post-123" />);

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('post-header')).toBeInTheDocument();
    expect(screen.getByTestId('post-content')).toBeInTheDocument();
  });

  it('uses reply variant by default', () => {
    render(<DialogPostPreview postId="test-post-123" />);

    const card = screen.getByTestId('card');
    expect(card.getAttribute('data-class-name')).not.toContain('bg-card');
  });

  it('applies bg-card class for repost variant', () => {
    render(<DialogPostPreview postId="test-post-123" variant="repost" />);

    const card = screen.getByTestId('card');
    expect(card.getAttribute('data-class-name')).toContain('bg-card');
  });

  it('does not apply bg-card class for reply variant', () => {
    render(<DialogPostPreview postId="test-post-123" variant="reply" />);

    const card = screen.getByTestId('card');
    expect(card.getAttribute('data-class-name')).not.toContain('bg-card');
  });

  it('applies custom className', () => {
    render(<DialogPostPreview postId="test-post-123" className="custom-class" />);

    const card = screen.getByTestId('card');
    expect(card.getAttribute('data-class-name')).toContain('custom-class');
  });

  it('renders PostHeader with correct postId', () => {
    render(<DialogPostPreview postId="test-post-456" />);

    expect(screen.getByTestId('post-header')).toHaveTextContent('PostHeader test-post-456');
  });

  it('renders PostContent with correct postId', () => {
    render(<DialogPostPreview postId="test-post-789" />);

    expect(screen.getByTestId('post-content')).toHaveTextContent('PostContent test-post-789');
  });
});
