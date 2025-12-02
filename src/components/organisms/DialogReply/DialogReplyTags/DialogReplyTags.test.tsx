import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DialogReplyTags } from './DialogReplyTags';

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
    }: {
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
      onBlur?: () => void;
      placeholder?: string;
      className?: string;
      ref?: React.Ref<HTMLInputElement>;
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
      />
    ),
  ),
  Button: vi.fn(
    ({
      onClick,
      children,
      'aria-label': ariaLabel,
      className,
    }: {
      onClick?: () => void;
      children: React.ReactNode;
      'aria-label'?: string;
      className?: string;
    }) => (
      <button data-testid="button" onClick={onClick} aria-label={ariaLabel} className={className}>
        {children}
      </button>
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
  PostTagAddButton: vi.fn(({ onClick }: { onClick: () => void }) => (
    <button data-testid="add-tag-button" onClick={onClick}>
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
    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByTestId('add-tag-button')).toBeInTheDocument();
  });

  it('renders existing tags', () => {
    render(<DialogReplyTags tags={['tag1', 'tag2']} onTagsChange={mockOnTagsChange} />);
    expect(screen.getByTestId('tag-tag1')).toBeInTheDocument();
    expect(screen.getByTestId('tag-tag2')).toBeInTheDocument();
  });

  it('calls onTagsChange when tag is removed', () => {
    render(<DialogReplyTags tags={['tag1', 'tag2']} onTagsChange={mockOnTagsChange} />);
    const closeButton = screen.getByTestId('tag-close-tag1');
    fireEvent.click(closeButton);
    expect(mockOnTagsChange).toHaveBeenCalledWith(['tag2']);
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

  it('inserts emoji into input when emoji is selected', () => {
    render(<DialogReplyTags tags={[]} onTagsChange={mockOnTagsChange} />);
    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);
    const buttons = screen.getAllByTestId('button');
    const emojiButton = buttons.find((btn) => btn.getAttribute('aria-label') === 'Open emoji picker');
    if (emojiButton) {
      fireEvent.click(emojiButton);
      const emojiSelect = screen.getByTestId('emoji-select');
      fireEvent.click(emojiSelect);
      // The emoji should be inserted into the input value
      const input = screen.getByTestId('tag-input') as HTMLInputElement;
      expect(input.value).toBe('😀');
    }
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

  it('matches snapshot with tags', () => {
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
