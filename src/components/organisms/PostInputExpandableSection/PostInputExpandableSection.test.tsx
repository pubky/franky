import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostInputExpandableSection } from './PostInputExpandableSection';
import { POST_INPUT_ACTION_SUBMIT_MODE } from '../PostInputActionBar/PostInputActionBar.constants';

// Use real libs, only stub cn for deterministic class joining
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  };
});

// Mock atoms
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
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  PostLinkEmbeds: ({ content }: { content: string }) => <div data-testid="post-link-embeds">{content}</div>,
  PostTag: ({ label, showClose, onClose }: { label: string; showClose?: boolean; onClose?: () => void }) => (
    <div data-testid="post-tag">
      {label}
      {showClose && (
        <button data-testid={`tag-close-${label}`} onClick={onClose}>
          ×
        </button>
      )}
    </div>
  ),
  EmojiPickerDialog: ({
    open,
    onOpenChange,
    onEmojiSelect,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEmojiSelect: (emoji: { native: string }) => void;
  }) =>
    open ? (
      <div data-testid="emoji-picker-dialog">
        <button data-testid="emoji-select" onClick={() => onEmojiSelect({ native: '😀' })}>
          Select Emoji
        </button>
        <button data-testid="emoji-close" onClick={() => onOpenChange(false)}>
          Close
        </button>
      </div>
    ) : null,
}));

// Mock PostInputTags
vi.mock('../PostInputTags', () => ({
  PostInputTags: ({
    tags,
    onTagsChange: _onTagsChange,
    disabled,
  }: {
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    disabled?: boolean;
  }) => (
    <div data-testid="post-input-tags" data-disabled={disabled}>
      {tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  ),
}));

// Mock PostInputActionBar
const mockOnPostClick = vi.fn();
vi.mock('../PostInputActionBar', () => ({
  PostInputActionBar: ({
    onPostClick,
    onEmojiClick,
    isPostDisabled,
    isSubmitting,
    submitMode,
  }: {
    onPostClick?: () => void;
    onEmojiClick?: () => void;
    isPostDisabled?: boolean;
    isSubmitting?: boolean;
    submitMode?: string;
  }) => (
    <div
      data-testid="post-input-action-bar"
      data-post-disabled={isPostDisabled}
      data-submitting={isSubmitting}
      data-submit-mode={submitMode}
    >
      <button data-testid="action-bar-post" onClick={onPostClick} disabled={isPostDisabled}>
        Post
      </button>
      <button data-testid="action-bar-emoji" onClick={onEmojiClick}>
        Emoji
      </button>
    </div>
  ),
  POST_INPUT_ACTION_SUBMIT_MODE: {
    POST: 'post',
    REPLY: 'reply',
  },
}));

describe('PostInputExpandableSection', () => {
  const defaultProps = {
    isExpanded: true,
    content: 'Test content',
    tags: [],
    isSubmitting: false,
    submitMode: POST_INPUT_ACTION_SUBMIT_MODE.POST,
    setTags: vi.fn(),
    onSubmit: mockOnPostClick,
    showEmojiPicker: false,
    setShowEmojiPicker: vi.fn(),
    onEmojiSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<PostInputExpandableSection {...defaultProps} />);

    expect(screen.getByTestId('post-input-action-bar')).toBeInTheDocument();
    expect(screen.getByTestId('post-input-tags')).toBeInTheDocument();
  });

  it('renders PostLinkEmbeds when content is present', () => {
    render(<PostInputExpandableSection {...defaultProps} content="Check https://example.com" />);

    expect(screen.getByTestId('post-link-embeds')).toBeInTheDocument();
  });

  it('does not render PostLinkEmbeds when content is empty', () => {
    render(<PostInputExpandableSection {...defaultProps} content="" />);

    expect(screen.queryByTestId('post-link-embeds')).not.toBeInTheDocument();
  });

  it('renders tags when tags array is not empty', () => {
    render(<PostInputExpandableSection {...defaultProps} tags={['tag1', 'tag2']} />);

    const tags = screen.getAllByTestId('post-tag');
    expect(tags).toHaveLength(2);
    const tagTexts = screen.getAllByText('tag1');
    expect(tagTexts.length).toBeGreaterThan(0);
    const tag2Texts = screen.getAllByText('tag2');
    expect(tag2Texts.length).toBeGreaterThan(0);
  });

  it('calls setTags when tag close button is clicked', () => {
    const setTags = vi.fn();
    render(
      <PostInputExpandableSection {...defaultProps} tags={['tag1', 'tag2']} setTags={setTags} isDisabled={false} />,
    );

    const closeButton = screen.getByTestId('tag-close-tag1');
    fireEvent.click(closeButton);

    expect(setTags).toHaveBeenCalled();
  });

  it('does not show tag close button when disabled', () => {
    render(<PostInputExpandableSection {...defaultProps} tags={['tag1']} isDisabled={true} isSubmitting={false} />);

    expect(screen.queryByTestId('tag-close-tag1')).not.toBeInTheDocument();
  });

  it('calls onSubmit when Post button is clicked', () => {
    const onSubmit = vi.fn();
    render(<PostInputExpandableSection {...defaultProps} onSubmit={onSubmit} content="Test" />);

    const postButton = screen.getByTestId('action-bar-post');
    fireEvent.click(postButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls setShowEmojiPicker when emoji button is clicked', () => {
    const setShowEmojiPicker = vi.fn();
    render(<PostInputExpandableSection {...defaultProps} setShowEmojiPicker={setShowEmojiPicker} isDisabled={false} />);

    const emojiButton = screen.getByTestId('action-bar-emoji');
    fireEvent.click(emojiButton);

    expect(setShowEmojiPicker).toHaveBeenCalledWith(true);
  });

  it('disables Post button when content is empty', () => {
    render(<PostInputExpandableSection {...defaultProps} content="" />);

    const postButton = screen.getByTestId('action-bar-post');
    expect(postButton).toBeDisabled();
  });

  it('disables Post button when isSubmitting is true', () => {
    render(<PostInputExpandableSection {...defaultProps} content="Test" isSubmitting={true} />);

    const postButton = screen.getByTestId('action-bar-post');
    expect(postButton).toBeDisabled();
  });

  it('disables Post button when isDisabled is true', () => {
    render(<PostInputExpandableSection {...defaultProps} content="Test" isDisabled={true} />);

    const postButton = screen.getByTestId('action-bar-post');
    expect(postButton).toBeDisabled();
  });

  it('renders EmojiPickerDialog when showEmojiPicker is true and not disabled', () => {
    render(
      <PostInputExpandableSection {...defaultProps} showEmojiPicker={true} isDisabled={false} isSubmitting={false} />,
    );

    expect(screen.getByTestId('emoji-picker-dialog')).toBeInTheDocument();
  });

  it('does not render EmojiPickerDialog when showEmojiPicker is false', () => {
    render(<PostInputExpandableSection {...defaultProps} showEmojiPicker={false} />);

    expect(screen.queryByTestId('emoji-picker-dialog')).not.toBeInTheDocument();
  });

  it('does not render EmojiPickerDialog when disabled', () => {
    render(<PostInputExpandableSection {...defaultProps} showEmojiPicker={true} isDisabled={true} />);

    expect(screen.queryByTestId('emoji-picker-dialog')).not.toBeInTheDocument();
  });

  it('calls onEmojiSelect when emoji is selected', () => {
    const onEmojiSelect = vi.fn();
    render(
      <PostInputExpandableSection
        {...defaultProps}
        showEmojiPicker={true}
        onEmojiSelect={onEmojiSelect}
        isDisabled={false}
        isSubmitting={false}
      />,
    );

    const emojiSelectButton = screen.getByTestId('emoji-select');
    fireEvent.click(emojiSelectButton);

    expect(onEmojiSelect).toHaveBeenCalledWith({ native: '😀' });
  });

  it('applies correct classes when expanded', () => {
    const { container } = render(<PostInputExpandableSection {...defaultProps} isExpanded={true} />);

    const expandableContainer = container.querySelector('[data-testid="container"]');
    expect(expandableContainer).toHaveClass('grid-rows-[1fr]');
    expect(expandableContainer).toHaveClass('opacity-100');
  });

  it('applies correct classes when collapsed', () => {
    const { container } = render(<PostInputExpandableSection {...defaultProps} isExpanded={false} />);

    const expandableContainer = container.querySelector('[data-testid="container"]');
    expect(expandableContainer).toHaveClass('grid-rows-[0fr]');
    expect(expandableContainer).toHaveClass('opacity-0');
  });
});

describe('PostInputExpandableSection - Snapshots', () => {
  const defaultProps = {
    isExpanded: true,
    content: 'Test content',
    tags: [],
    isSubmitting: false,
    submitMode: POST_INPUT_ACTION_SUBMIT_MODE.POST,
    setTags: vi.fn(),
    onSubmit: vi.fn(),
    showEmojiPicker: false,
    setShowEmojiPicker: vi.fn(),
    onEmojiSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot when expanded with content', () => {
    const { container } = render(
      <PostInputExpandableSection {...defaultProps} content="Test content with link https://example.com" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when expanded with tags', () => {
    const { container } = render(<PostInputExpandableSection {...defaultProps} tags={['tag1', 'tag2']} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when collapsed', () => {
    const { container } = render(<PostInputExpandableSection {...defaultProps} isExpanded={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with REPLY submit mode', () => {
    const { container } = render(
      <PostInputExpandableSection {...defaultProps} submitMode={POST_INPUT_ACTION_SUBMIT_MODE.REPLY} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when submitting', () => {
    const { container } = render(<PostInputExpandableSection {...defaultProps} isSubmitting={true} content="Test" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when disabled', () => {
    const { container } = render(<PostInputExpandableSection {...defaultProps} isDisabled={true} content="Test" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with emoji picker open', () => {
    const { container } = render(
      <PostInputExpandableSection {...defaultProps} showEmojiPicker={true} isDisabled={false} isSubmitting={false} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
