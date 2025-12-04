import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DialogReplyActionBar } from './DialogReplyActionBar';

// Use real libs, only stub cn for deterministic class joining
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  };
});

// Minimal atoms used by DialogReplyActionBar
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
    as?: string;
    size?: string;
    className?: string;
  }) => {
    const Tag = (as || 'p') as keyof JSX.IntrinsicElements;
    return (
      <Tag data-testid="typography" data-as={as} data-size={size} className={className}>
        {children}
      </Tag>
    );
  },
}));

describe('DialogReplyActionBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all action buttons with aria labels', () => {
    render(<DialogReplyActionBar />);

    expect(screen.getByRole('button', { name: 'Add emoji' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add image' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add file' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add article' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post reply' })).toBeInTheDocument();
  });

  it('invokes callbacks when buttons are clicked', () => {
    const onEmojiClick = vi.fn();
    const onImageClick = vi.fn();
    const onFileClick = vi.fn();
    const onArticleClick = vi.fn();
    const onPostClick = vi.fn();

    render(
      <DialogReplyActionBar
        onEmojiClick={onEmojiClick}
        onImageClick={onImageClick}
        onFileClick={onFileClick}
        onArticleClick={onArticleClick}
        onPostClick={onPostClick}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add emoji' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add image' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add file' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add article' }));
    fireEvent.click(screen.getByRole('button', { name: 'Post reply' }));

    expect(onEmojiClick).toHaveBeenCalledTimes(1);
    expect(onImageClick).toHaveBeenCalledTimes(1);
    expect(onFileClick).toHaveBeenCalledTimes(1);
    expect(onArticleClick).toHaveBeenCalledTimes(1);
    expect(onPostClick).toHaveBeenCalledTimes(1);
  });

  it('disables Post button when isPostDisabled is true', () => {
    render(<DialogReplyActionBar isPostDisabled={true} />);

    const postButton = screen.getByRole('button', { name: 'Post reply' });
    expect(postButton).toBeDisabled();
  });

  it('enables Post button when isPostDisabled is false and handler is provided', () => {
    const onPostClick = vi.fn();
    render(<DialogReplyActionBar isPostDisabled={false} onPostClick={onPostClick} />);

    const postButton = screen.getByRole('button', { name: 'Post reply' });
    expect(postButton).not.toBeDisabled();
  });

  it('disables buttons without handlers', () => {
    render(<DialogReplyActionBar />);

    expect(screen.getByRole('button', { name: 'Add emoji' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add image' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add file' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add article' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Post reply' })).toBeDisabled();
  });

  it('renders Post button with label text', () => {
    render(<DialogReplyActionBar />);

    const postButton = screen.getByRole('button', { name: 'Post reply' });
    expect(postButton).toHaveTextContent('Post');
  });
});

describe('DialogReplyActionBar - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot with default props', () => {
    const { container } = render(<DialogReplyActionBar />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with all callbacks', () => {
    const onEmojiClick = vi.fn();
    const onImageClick = vi.fn();
    const onFileClick = vi.fn();
    const onArticleClick = vi.fn();
    const onPostClick = vi.fn();

    const { container } = render(
      <DialogReplyActionBar
        onEmojiClick={onEmojiClick}
        onImageClick={onImageClick}
        onFileClick={onFileClick}
        onArticleClick={onArticleClick}
        onPostClick={onPostClick}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with disabled post button', () => {
    const { container } = render(<DialogReplyActionBar isPostDisabled={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
