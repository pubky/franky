import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DialogActionBar } from './DialogActionBar';

vi.mock('@/atoms', () => ({
  Button: vi.fn(({ children, onClick, disabled, className, 'aria-label': ariaLabel }) => (
    <button
      data-testid={ariaLabel ? `button-${ariaLabel.replace(/\s+/g, '-').toLowerCase()}` : 'button'}
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )),
}));

vi.mock('@/libs', () => ({
  Smile: vi.fn(({ className }) => <div data-testid="icon-smile" className={className} />),
  Image: vi.fn(({ className }) => <div data-testid="icon-image" className={className} />),
  Paperclip: vi.fn(({ className }) => <div data-testid="icon-paperclip" className={className} />),
  Newspaper: vi.fn(({ className }) => <div data-testid="icon-newspaper" className={className} />),
  Send: vi.fn(({ className }) => <div data-testid="icon-send" className={className} />),
  Repeat: vi.fn(({ className }) => <div data-testid="icon-repeat" className={className} />),
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('DialogActionBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all action buttons for reply variant', () => {
    render(<DialogActionBar variant="reply" />);

    expect(screen.getByTestId('button-add-emoji')).toBeInTheDocument();
    expect(screen.getByTestId('button-add-image')).toBeInTheDocument();
    expect(screen.getByTestId('button-add-file')).toBeInTheDocument();
    expect(screen.getByTestId('button-add-article')).toBeInTheDocument();
    expect(screen.getByTestId('button-post-reply')).toBeInTheDocument();
  });

  it('renders all action buttons for repost variant', () => {
    render(<DialogActionBar variant="repost" />);

    expect(screen.getByTestId('button-add-emoji')).toBeInTheDocument();
    expect(screen.getByTestId('button-add-image')).toBeInTheDocument();
    expect(screen.getByTestId('button-add-file')).toBeInTheDocument();
    expect(screen.getByTestId('button-add-article')).toBeInTheDocument();
    expect(screen.getByTestId('button-repost')).toBeInTheDocument();
  });

  it('renders all action buttons for new variant', () => {
    render(<DialogActionBar variant="new" />);

    expect(screen.getByTestId('button-add-emoji')).toBeInTheDocument();
    expect(screen.getByTestId('button-add-image')).toBeInTheDocument();
    expect(screen.getByTestId('button-add-file')).toBeInTheDocument();
    expect(screen.getByTestId('button-add-article')).toBeInTheDocument();
    expect(screen.getByTestId('button-post')).toBeInTheDocument();
  });

  it('shows Post label for reply variant', () => {
    render(<DialogActionBar variant="reply" />);

    const postButton = screen.getByTestId('button-post-reply');
    expect(postButton).toHaveTextContent('Post');
  });

  it('shows Repost label for repost variant', () => {
    render(<DialogActionBar variant="repost" />);

    const repostButton = screen.getByTestId('button-repost');
    expect(repostButton).toHaveTextContent('Repost');
  });

  it('shows Post label for new variant', () => {
    render(<DialogActionBar variant="new" />);

    const postButton = screen.getByTestId('button-post');
    expect(postButton).toHaveTextContent('Post');
  });

  it('calls onActionClick when action button is clicked for reply', () => {
    const onActionClick = vi.fn();
    render(<DialogActionBar variant="reply" onActionClick={onActionClick} />);

    const postButton = screen.getByTestId('button-post-reply');
    fireEvent.click(postButton);

    expect(onActionClick).toHaveBeenCalledTimes(1);
  });

  it('calls onActionClick when action button is clicked for repost', () => {
    const onActionClick = vi.fn();
    render(<DialogActionBar variant="repost" onActionClick={onActionClick} />);

    const repostButton = screen.getByTestId('button-repost');
    fireEvent.click(repostButton);

    expect(onActionClick).toHaveBeenCalledTimes(1);
  });

  it('calls onActionClick when action button is clicked for new', () => {
    const onActionClick = vi.fn();
    render(<DialogActionBar variant="new" onActionClick={onActionClick} />);

    const postButton = screen.getByTestId('button-post');
    fireEvent.click(postButton);

    expect(onActionClick).toHaveBeenCalledTimes(1);
  });

  it('disables action button when isActionDisabled is true', () => {
    render(<DialogActionBar variant="reply" isActionDisabled={true} />);

    const postButton = screen.getByTestId('button-post-reply');
    expect(postButton).toBeDisabled();
  });

  it('enables action button when isActionDisabled is false', () => {
    render(<DialogActionBar variant="reply" isActionDisabled={false} />);

    const postButton = screen.getByTestId('button-post-reply');
    expect(postButton).not.toBeDisabled();
  });

  it('calls onClick handlers for other buttons', () => {
    const onEmojiClick = vi.fn();
    const onImageClick = vi.fn();
    const onFileClick = vi.fn();
    const onArticleClick = vi.fn();

    render(
      <DialogActionBar
        variant="reply"
        onEmojiClick={onEmojiClick}
        onImageClick={onImageClick}
        onFileClick={onFileClick}
        onArticleClick={onArticleClick}
      />,
    );

    fireEvent.click(screen.getByTestId('button-add-emoji'));
    fireEvent.click(screen.getByTestId('button-add-image'));
    fireEvent.click(screen.getByTestId('button-add-file'));
    fireEvent.click(screen.getByTestId('button-add-article'));

    expect(onEmojiClick).toHaveBeenCalledTimes(1);
    expect(onImageClick).toHaveBeenCalledTimes(1);
    expect(onFileClick).toHaveBeenCalledTimes(1);
    expect(onArticleClick).toHaveBeenCalledTimes(1);
  });
});
