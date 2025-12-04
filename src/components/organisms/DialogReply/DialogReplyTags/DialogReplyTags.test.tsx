import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DialogReplyTags } from './DialogReplyTags';
import { POST_MAX_TAGS } from '@/config';

// Mock state for TagInput simulation
let mockTagInputValue = '';
let mockShowEmojiPicker = false;

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
  Typography: vi.fn(
    ({
      children,
      as,
      size,
      className,
    }: {
      children: React.ReactNode;
      as?: string;
      size?: string;
      className?: string;
    }) => (
      <span data-testid="typography" data-as={as} data-size={size} className={className}>
        {children}
      </span>
    ),
  ),
}));

vi.mock('@/molecules', () => ({
  PostTagAddButton: vi.fn(({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
    <button data-testid="add-tag-button" onClick={onClick} disabled={disabled}>
      +
    </button>
  )),
  TagInput: vi.fn(
    ({
      onTagAdd,
      placeholder,
      showCloseButton,
      onClose,
      disabled,
      maxTags,
      currentTagsCount,
      onBlur,
    }: {
      onTagAdd: (tag: string) => void;
      placeholder?: string;
      showCloseButton?: boolean;
      onClose?: () => void;
      hideSuggestions?: boolean;
      disabled?: boolean;
      maxTags?: number;
      currentTagsCount?: number;
      limitReachedPlaceholder?: string;
      onBlur?: () => void;
    }) => {
      const isAtLimit = maxTags !== undefined && (currentTagsCount ?? 0) >= maxTags;
      return (
        <div data-testid="tag-input-wrapper">
          <input
            data-testid="tag-input"
            value={mockTagInputValue}
            placeholder={isAtLimit ? 'limit reached' : placeholder}
            disabled={disabled || isAtLimit}
            onChange={(e) => {
              mockTagInputValue = e.target.value;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && mockTagInputValue.trim()) {
                e.preventDefault();
                onTagAdd(mockTagInputValue.trim());
                mockTagInputValue = '';
              }
            }}
            onBlur={() => {
              if (!mockTagInputValue && onBlur) {
                onBlur();
              }
            }}
          />
          <button
            data-testid="emoji-button"
            aria-label="Open emoji picker"
            onClick={() => {
              mockShowEmojiPicker = true;
            }}
            disabled={disabled || isAtLimit}
          >
            😀
          </button>
          {showCloseButton && (
            <button data-testid="close-button" aria-label="Close tag input" onClick={onClose}>
              ×
            </button>
          )}
          {mockShowEmojiPicker && (
            <div data-testid="emoji-picker-dialog">
              <button
                data-testid="emoji-select"
                onClick={() => {
                  mockTagInputValue += '😀';
                }}
              >
                Select Emoji
              </button>
            </div>
          )}
        </div>
      );
    },
  ),
}));

vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  };
});

describe('DialogReplyTags', () => {
  const mockOnTagsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockTagInputValue = '';
    mockShowEmojiPicker = false;
  });

  it('renders with empty tags array', () => {
    render(<DialogReplyTags tags={[]} onTagsChange={mockOnTagsChange} />);
    expect(screen.getAllByTestId('container').length).toBeGreaterThan(0);
    expect(screen.getByTestId('add-tag-button')).toBeInTheDocument();
  });

  it('does not render tags (tags are rendered by parent component)', () => {
    render(<DialogReplyTags tags={['tag1', 'tag2']} onTagsChange={mockOnTagsChange} />);
    // Tags are no longer rendered by DialogReplyTags - they're rendered by DialogReplyInput
    expect(screen.queryByTestId('tag-tag1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tag-tag2')).not.toBeInTheDocument();
    // Should show tag count indicator
    expect(screen.getByText(`2/${POST_MAX_TAGS}`)).toBeInTheDocument();
  });

  it('shows TagInput when add button is clicked', () => {
    render(<DialogReplyTags tags={[]} onTagsChange={mockOnTagsChange} />);
    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);
    expect(screen.getByTestId('tag-input-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('tag-input')).toBeInTheDocument();
  });

  it('adds tag when Enter is pressed in input', () => {
    render(<DialogReplyTags tags={[]} onTagsChange={mockOnTagsChange} />);
    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);
    const input = screen.getByTestId('tag-input');
    fireEvent.change(input, { target: { value: 'new-tag' } });
    mockTagInputValue = 'new-tag';
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockOnTagsChange).toHaveBeenCalledWith(['new-tag']);
  });

  it('does not add duplicate tags', () => {
    render(<DialogReplyTags tags={['existing-tag']} onTagsChange={mockOnTagsChange} />);
    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);
    const input = screen.getByTestId('tag-input');
    fireEvent.change(input, { target: { value: 'existing-tag' } });
    mockTagInputValue = 'existing-tag';
    fireEvent.keyDown(input, { key: 'Enter' });
    // Should not call onTagsChange for duplicates
    expect(mockOnTagsChange).not.toHaveBeenCalled();
  });

  it('closes input when close button is clicked', () => {
    render(<DialogReplyTags tags={[]} onTagsChange={mockOnTagsChange} />);
    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);
    expect(screen.getByTestId('tag-input-wrapper')).toBeInTheDocument();
    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);
    expect(screen.queryByTestId('tag-input-wrapper')).not.toBeInTheDocument();
  });

  it('renders emoji button in TagInput', () => {
    render(<DialogReplyTags tags={[]} onTagsChange={mockOnTagsChange} />);
    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);
    const emojiButton = screen.getByTestId('emoji-button');
    expect(emojiButton).toBeInTheDocument();
    expect(emojiButton).toHaveAttribute('aria-label', 'Open emoji picker');
  });

  it('disables add button when POST_MAX_TAGS limit is reached', () => {
    const maxTags = Array.from({ length: POST_MAX_TAGS }, (_, i) => `tag${i + 1}`);
    render(<DialogReplyTags tags={maxTags} onTagsChange={mockOnTagsChange} />);
    const addButton = screen.getByTestId('add-tag-button');
    expect(addButton).toBeDisabled();
    expect(screen.getByText(`${POST_MAX_TAGS}/${POST_MAX_TAGS}`)).toBeInTheDocument();
  });

  it('shows tag count indicator when tags exist', () => {
    render(<DialogReplyTags tags={['tag1', 'tag2']} onTagsChange={mockOnTagsChange} />);
    expect(screen.getByText(`2/${POST_MAX_TAGS}`)).toBeInTheDocument();
  });

  it('uses custom maxTags when provided', () => {
    const customMax = 3;
    const tags = ['tag1', 'tag2', 'tag3'];
    render(<DialogReplyTags tags={tags} onTagsChange={mockOnTagsChange} maxTags={customMax} />);
    const addButton = screen.getByTestId('add-tag-button');
    expect(addButton).toBeDisabled();
    expect(screen.getByText(`3/3`)).toBeInTheDocument();
  });
});

describe('DialogReplyTags - Snapshots', () => {
  const mockOnTagsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockTagInputValue = '';
    mockShowEmojiPicker = false;
  });

  it('matches snapshot with empty tags', () => {
    const { container } = render(<DialogReplyTags tags={[]} onTagsChange={mockOnTagsChange} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with tags (tags not rendered by this component)', () => {
    const { container } = render(<DialogReplyTags tags={['tag1', 'tag2']} onTagsChange={mockOnTagsChange} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with input open', () => {
    const { container } = render(<DialogReplyTags tags={[]} onTagsChange={mockOnTagsChange} />);
    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);
    expect(container.firstChild).toMatchSnapshot();
  });
});
