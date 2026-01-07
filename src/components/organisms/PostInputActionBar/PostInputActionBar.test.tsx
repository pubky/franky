import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostInputActionBar } from './PostInputActionBar';

// Use real libs - use actual implementations
vi.mock('@/libs', async () => {
  const actual = await vi.importActual('@/libs');
  return { ...actual };
});

// Minimal atoms used by PostInputActionBar
vi.mock('@/atoms', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
    variant,
    size,
    style,
    'aria-label': aria,
  }: {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler;
    disabled?: boolean;
    className?: string;
    variant?: string;
    size?: string;
    style?: React.CSSProperties;
    'aria-label'?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
      data-size={size}
      style={style}
      aria-label={aria}
    >
      {children}
    </button>
  ),
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
    as,
    size,
    className,
  }: {
    children: React.ReactNode;
    as?: React.ElementType;
    size?: string;
    className?: string;
  }) => {
    const Tag = as || 'p';
    return (
      <Tag data-testid="typography" data-as={as} data-size={size} className={className}>
        {children}
      </Tag>
    );
  },
}));

describe('PostInputActionBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all action buttons with aria labels', () => {
    render(<PostInputActionBar />);

    expect(screen.getByRole('button', { name: 'Add emoji' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add file' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add article' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post' })).toBeInTheDocument();
  });

  it('invokes callbacks when buttons are clicked', () => {
    const onEmojiClick = vi.fn();
    const onFileClick = vi.fn();
    const onArticleClick = vi.fn();
    const onPostClick = vi.fn();

    render(
      <PostInputActionBar
        onEmojiClick={onEmojiClick}
        onFileClick={onFileClick}
        onArticleClick={onArticleClick}
        onPostClick={onPostClick}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add emoji' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add file' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add article' }));
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));

    expect(onEmojiClick).toHaveBeenCalledTimes(1);
    expect(onFileClick).toHaveBeenCalledTimes(1);
    expect(onArticleClick).toHaveBeenCalledTimes(1);
    expect(onPostClick).toHaveBeenCalledTimes(1);
  });

  it('disables Post button when isPostDisabled is true', () => {
    render(<PostInputActionBar isPostDisabled={true} />);

    const postButton = screen.getByRole('button', { name: 'Post' });
    expect(postButton).toBeDisabled();
  });

  it('enables Post button when isPostDisabled is false and handler is provided', () => {
    const onPostClick = vi.fn();
    render(<PostInputActionBar isPostDisabled={false} onPostClick={onPostClick} />);

    const postButton = screen.getByRole('button', { name: 'Post' });
    expect(postButton).not.toBeDisabled();
  });

  it('disables buttons without handlers', () => {
    render(<PostInputActionBar />);

    expect(screen.getByRole('button', { name: 'Add emoji' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add file' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add article' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
  });

  it('renders Post button with label text', () => {
    render(<PostInputActionBar />);

    const postButton = screen.getByRole('button', { name: 'Post' });
    expect(postButton).toHaveTextContent('Post');
  });

  it('shows loading state when isSubmitting is true', () => {
    render(<PostInputActionBar onPostClick={vi.fn()} isSubmitting={true} />);

    const postButton = screen.getByRole('button', { name: 'Posting...' });
    expect(postButton).toHaveTextContent('Posting...');
  });

  it('disables all buttons when isSubmitting is true', () => {
    render(<PostInputActionBar onEmojiClick={vi.fn()} isSubmitting={true} />);

    expect(screen.getByRole('button', { name: 'Add emoji' })).toBeDisabled();
  });

  it('renders reply labeling when postButtonAriaLabel is Reply', () => {
    render(<PostInputActionBar postButtonLabel="Reply" postButtonAriaLabel="Reply" />);
    expect(screen.getByRole('button', { name: 'Reply' })).toBeInTheDocument();
  });
});

describe('PostInputActionBar - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot with default props', () => {
    const { container } = render(<PostInputActionBar />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with all callbacks', () => {
    const onEmojiClick = vi.fn();
    const onFileClick = vi.fn();
    const onArticleClick = vi.fn();
    const onPostClick = vi.fn();

    const { container } = render(
      <PostInputActionBar
        onEmojiClick={onEmojiClick}
        onFileClick={onFileClick}
        onArticleClick={onArticleClick}
        onPostClick={onPostClick}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with disabled post button', () => {
    const { container } = render(<PostInputActionBar isPostDisabled={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with hideArticle prop', () => {
    const { container } = render(<PostInputActionBar hideArticle={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
