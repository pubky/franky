import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SinglePostCard } from './SinglePostCard';

// Mock organisms
vi.mock('@/organisms', () => ({
  PostHeader: ({ postId }: { postId: string }) => <div data-testid="post-header">Header: {postId}</div>,
  PostContent: ({ postId }: { postId: string }) => <div data-testid="post-content">Content: {postId}</div>,
  PostActionsBar: ({ postId, onReplyClick }: { postId: string; onReplyClick?: () => void }) => (
    <div data-testid="post-actions-bar" onClick={onReplyClick}>
      Actions: {postId}
    </div>
  ),
  PostTagsPanel: ({ postId }: { postId: string }) => <div data-testid="post-tags-panel">Tags: {postId}</div>,
  DialogReply: ({ postId, open }: { postId: string; open: boolean }) => (
    <div data-testid="dialog-reply" data-open={open}>
      Reply Dialog: {postId}
    </div>
  ),
}));

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
  Container: ({
    children,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  ),
}));

// Mock libs
vi.mock('@/libs', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

describe('SinglePostCard', () => {
  const mockPostId = 'author:post123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the card with post header, content, actions and tags', () => {
      render(<SinglePostCard postId={mockPostId} />);

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('post-header')).toBeInTheDocument();
      expect(screen.getByTestId('post-content')).toBeInTheDocument();
      expect(screen.getByTestId('post-actions-bar')).toBeInTheDocument();
      // Two PostTagsPanel instances - one for mobile and one for desktop
      expect(screen.getAllByTestId('post-tags-panel')).toHaveLength(2);
    });

    it('should render the dialog reply component', () => {
      render(<SinglePostCard postId={mockPostId} />);

      expect(screen.getByTestId('dialog-reply')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-reply')).toHaveAttribute('data-open', 'false');
    });

    it('should apply custom className to the card', () => {
      render(<SinglePostCard postId={mockPostId} className="custom-class" />);

      expect(screen.getByTestId('card')).toHaveClass('custom-class');
    });
  });

  describe('interactions', () => {
    it('should open reply dialog when reply action is clicked', () => {
      render(<SinglePostCard postId={mockPostId} />);

      const actionsBar = screen.getByTestId('post-actions-bar');
      fireEvent.click(actionsBar);

      expect(screen.getByTestId('dialog-reply')).toHaveAttribute('data-open', 'true');
    });
  });

  describe('post ID propagation', () => {
    it('should pass postId to all child components', () => {
      render(<SinglePostCard postId={mockPostId} />);

      expect(screen.getByText(`Header: ${mockPostId}`)).toBeInTheDocument();
      expect(screen.getByText(`Content: ${mockPostId}`)).toBeInTheDocument();
      expect(screen.getByText(`Actions: ${mockPostId}`)).toBeInTheDocument();
      expect(screen.getAllByText(`Tags: ${mockPostId}`)).toHaveLength(2);
      expect(screen.getByText(`Reply Dialog: ${mockPostId}`)).toBeInTheDocument();
    });
  });
});
