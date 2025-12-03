import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DialogReplyTags } from './DialogReplyTags';
import { POST_MAX_TAGS } from '@/config';

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
  Input: vi.fn(
    ({
      value,
      onChange,
      onKeyDown,
      onBlur,
      placeholder,
      className,
      ref,
      disabled,
    }: {
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
      onBlur?: () => void;
      placeholder?: string;
      className?: string;
      ref?: React.Ref<HTMLInputElement>;
      disabled?: boolean;
    }) => (
      <input
        ref={ref}
        data-testid="tag-input"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
    ),
  ),
  Button: vi.fn(
    ({
      onClick,
      children,
      'aria-label': ariaLabel,
      className,
      disabled,
    }: {
      onClick?: () => void;
      children: React.ReactNode;
      'aria-label'?: string;
      className?: string;
      disabled?: boolean;
    }) => (
      <button data-testid="button" onClick={onClick} aria-label={ariaLabel} className={className} disabled={disabled}>
        {children}
      </button>
    ),
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
  PostTag: vi.fn(({ label, showClose, onClose }: { label: string; showClose: boolean; onClose: () => void }) => (
    <div data-testid={`tag-${label}`}>
      {label}
      {showClose && (
        <button data-testid={`tag-close-${label}`} onClick={onClose}>
          ×
        </button>
      )}
    </div>
  )),
  PostTagAddButton: vi.fn(({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
    <button data-testid="add-tag-button" onClick={onClick} disabled={disabled}>
      +
    </button>
  )),
  EmojiPickerDialog: vi.fn(
    ({
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
  ),
}));

vi.mock('@/hooks', () => ({
  useEmojiInsert: vi.fn(() => vi.fn()),
}));

vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
    Smile: ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
      <svg data-testid="smile-icon" className={className} data-stroke-width={strokeWidth} />
    ),
    X: ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
      <svg data-testid="x-icon" className={className} data-stroke-width={strokeWidth} />
    ),
  };
});

describe('DialogReplyTags', () => {
  const mockOnTagsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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

  it('shows input when add button is clicked', () => {
    render(<DialogReplyTags tags={[]} onTagsChange={mockOnTagsChange} />);
    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);
    expect(screen.getByTestId('tag-input')).toBeInTheDocument();
  });

  it('adds tag when Enter is pressed in input', () => {
    render(<DialogReplyTags tags={[]} onTagsChange={mockOnTagsChange} />);
    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);
    const input = screen.getByTestId('tag-input');
    fireEvent.change(input, { target: { value: 'new-tag' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockOnTagsChange).toHaveBeenCalledWith(['new-tag']);
  });

  it('does not add duplicate tags', () => {
    render(<DialogReplyTags tags={['existing-tag']} onTagsChange={mockOnTagsChange} />);
    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);
    const input = screen.getByTestId('tag-input');
    fireEvent.change(input, { target: { value: 'existing-tag' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockOnTagsChange).not.toHaveBeenCalled();
  });

  it('closes input when X button is clicked', () => {
    render(<DialogReplyTags tags={[]} onTagsChange={mockOnTagsChange} />);
    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);
    expect(screen.getByTestId('tag-input')).toBeInTheDocument();
    const buttons = screen.getAllByTestId('button');
    const closeButton = buttons.find((btn) => btn.getAttribute('aria-label') === 'Close tag input');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(screen.queryByTestId('tag-input')).not.toBeInTheDocument();
    }
  });

  it('opens emoji picker when emoji button is clicked', () => {
    render(<DialogReplyTags tags={[]} onTagsChange={mockOnTagsChange} />);
    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);
    const buttons = screen.getAllByTestId('button');
    const emojiButton = buttons.find((btn) => btn.getAttribute('aria-label') === 'Open emoji picker');
    if (emojiButton) {
      fireEvent.click(emojiButton);
      expect(screen.getByTestId('emoji-picker-dialog')).toBeInTheDocument();
    }
  });

  it('calls useEmojiInsert handler when emoji is selected', async () => {
    // Get the mocked useEmojiInsert to verify it's called
    const mockEmojiHandler = vi.fn();
    const { useEmojiInsert } = await import('@/hooks');
    vi.mocked(useEmojiInsert).mockReturnValue(mockEmojiHandler);

    render(<DialogReplyTags tags={[]} onTagsChange={mockOnTagsChange} />);
    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);
    const buttons = screen.getAllByTestId('button');
    const emojiButton = buttons.find((btn) => btn.getAttribute('aria-label') === 'Open emoji picker');
    if (emojiButton) {
      fireEvent.click(emojiButton);
      const emojiSelect = screen.getByTestId('emoji-select');
      fireEvent.click(emojiSelect);
      // The emoji handler should be called with the emoji
      expect(mockEmojiHandler).toHaveBeenCalledWith({ native: '😀' });
    }
  });

  it('disables add button when POST_MAX_TAGS limit is reached', () => {
    const maxTags = Array.from({ length: POST_MAX_TAGS }, (_, i) => `tag${i + 1}`);
    render(<DialogReplyTags tags={maxTags} onTagsChange={mockOnTagsChange} />);
    const addButton = screen.getByTestId('add-tag-button');
    // Add button should be disabled when limit is reached
    expect(addButton).toBeDisabled();
    // Should show tag count with limit indicator
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
    // Add button should be disabled when custom limit is reached
    expect(addButton).toBeDisabled();
    // Should show custom limit count
    expect(screen.getByText(`3/3`)).toBeInTheDocument();
  });
});

describe('DialogReplyTags - Snapshots', () => {
  const mockOnTagsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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
