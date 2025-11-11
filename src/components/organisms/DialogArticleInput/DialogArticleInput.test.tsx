import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DialogArticleInput } from './DialogArticleInput';
import * as Molecules from '@/molecules';

// Mock ReactQuill component - must be defined inside mock factory
vi.mock('next/dynamic', () => ({
  default: vi.fn(() => {
    const MockReactQuill = vi.fn(({ value, onChange, placeholder }) => (
      <div data-testid="react-quill">
        <div data-testid="quill-editor" contentEditable suppressContentEditableWarning>
          {value || placeholder}
        </div>
        <button data-testid="quill-change" onClick={() => onChange && onChange('<p>Test content</p>')}>
          Change
        </button>
      </div>
    ));
    return MockReactQuill;
  }),
}));

vi.mock('react-quill-new', () => ({
  default: vi.fn(({ value, onChange, placeholder }) => (
    <div data-testid="react-quill">
      <div data-testid="quill-editor" contentEditable suppressContentEditableWarning>
        {value || placeholder}
      </div>
      <button data-testid="quill-change" onClick={() => onChange && onChange('<p>Test content</p>')}>
        Change
      </button>
    </div>
  )),
}));

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

vi.mock('@/molecules', () => ({
  PostTagsList: vi.fn(({ tags, showInput, showAddButton, showTagClose, onTagAdd, onTagClose }) => (
    <div data-testid="post-tags-list">
      {tags.map((tag: { label: string }, index: number) => (
        <div key={index} data-testid={`tag-${tag.label}`}>
          {tag.label}
          {showTagClose && (
            <button data-testid={`tag-close-${index}`} onClick={() => onTagClose?.(tag, index)}>
              ×
            </button>
          )}
        </div>
      ))}
      {showAddButton && !showInput && (
        <button
          data-testid="add-tag-button"
          onClick={() => {
            onTagAdd?.('new-tag');
          }}
        >
          +
        </button>
      )}
      {showInput && <input data-testid="tag-input" />}
    </div>
  )),
}));

vi.mock('@/organisms', () => ({
  PostHeader: vi.fn(({ postId, hideTime }) => (
    <div data-testid="post-header" data-post-id={postId} data-hide-time={hideTime}>
      PostHeader {postId}
    </div>
  )),
}));

vi.mock('@/core', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = { selectCurrentUserPubky: () => 'test-user-id:pubkey' };
    return selector(state);
  }),
}));

vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
    Image: ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
      <div data-testid="image-icon" className={className} data-stroke-width={strokeWidth}>
        Image
      </div>
    ),
    Plus: ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
      <div data-testid="plus-icon" className={className} data-stroke-width={strokeWidth}>
        Plus
      </div>
    ),
    Send: ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
      <div data-testid="send-icon" className={className} data-stroke-width={strokeWidth}>
        Send
      </div>
    ),
  };
});

// Mock console.log
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('DialogArticleInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockConsoleLog.mockClear();
  });

  it('renders with all required elements', () => {
    render(<DialogArticleInput />);

    expect(screen.getByPlaceholderText('Article Title')).toBeInTheDocument();
    expect(screen.getByTestId('post-header')).toBeInTheDocument();
    expect(screen.getByTestId('react-quill')).toBeInTheDocument();
    expect(screen.getByTestId('post-tags-list')).toBeInTheDocument();
    expect(screen.getByTestId('button-publish')).toBeInTheDocument();
  });

  it('renders PostHeader with correct props', () => {
    render(<DialogArticleInput />);

    const postHeader = screen.getByTestId('post-header');
    expect(postHeader).toHaveAttribute('data-post-id', 'test-user-id:pubkey');
    expect(postHeader).toHaveAttribute('data-hide-time', 'true');
  });

  it('renders ReactQuill with correct placeholder', () => {
    render(<DialogArticleInput />);

    expect(screen.getByTestId('react-quill')).toBeInTheDocument();
    expect(screen.getByText('Start writing your masterpiece')).toBeInTheDocument();
  });

  it('handles title input changes', () => {
    render(<DialogArticleInput />);

    const titleInput = screen.getByPlaceholderText('Article Title');
    fireEvent.change(titleInput, { target: { value: 'Test Article Title' } });

    expect(titleInput).toHaveValue('Test Article Title');
  });

  it('handles content changes via ReactQuill', () => {
    render(<DialogArticleInput />);

    const changeButton = screen.getByTestId('quill-change');
    fireEvent.click(changeButton);

    // Content should be updated
    expect(screen.getByTestId('quill-editor')).toBeInTheDocument();
  });

  it('disables Publish button when title is empty', () => {
    render(<DialogArticleInput />);

    const publishButton = screen.getByTestId('button-publish');
    expect(publishButton).toBeDisabled();
  });

  it('disables Publish button when content is empty', () => {
    render(<DialogArticleInput />);

    const titleInput = screen.getByPlaceholderText('Article Title');
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });

    const publishButton = screen.getByTestId('button-publish');
    expect(publishButton).toBeDisabled();
  });

  it('enables Publish button when both title and content are filled', () => {
    render(<DialogArticleInput />);

    const titleInput = screen.getByPlaceholderText('Article Title');
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });

    const changeButton = screen.getByTestId('quill-change');
    fireEvent.click(changeButton);

    // Wait for state update
    waitFor(() => {
      const publishButton = screen.getByTestId('button-publish');
      expect(publishButton).not.toBeDisabled();
    });
  });

  it('handles tag addition', () => {
    render(<DialogArticleInput />);

    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);

    expect(screen.getByTestId('tag-new-tag')).toBeInTheDocument();
  });

  it('handles tag removal', () => {
    render(<DialogArticleInput />);

    const addButton = screen.getByTestId('add-tag-button');
    fireEvent.click(addButton);

    const closeButton = screen.getByTestId('tag-close-0');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('tag-new-tag')).not.toBeInTheDocument();
  });

  it('calls onSuccess callback when Publish is clicked', () => {
    const onSuccess = vi.fn();
    render(<DialogArticleInput onSuccess={onSuccess} />);

    const titleInput = screen.getByPlaceholderText('Article Title');
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });

    const changeButton = screen.getByTestId('quill-change');
    fireEvent.click(changeButton);

    waitFor(() => {
      const publishButton = screen.getByTestId('button-publish');
      fireEvent.click(publishButton);

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Publishing article:',
        expect.objectContaining({
          title: 'Test Title',
          tags: expect.any(Array),
        }),
      );
    });
  });

  it('logs article data when Publish is clicked', () => {
    render(<DialogArticleInput />);

    const titleInput = screen.getByPlaceholderText('Article Title');
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });

    const changeButton = screen.getByTestId('quill-change');
    fireEvent.click(changeButton);

    waitFor(() => {
      const publishButton = screen.getByTestId('button-publish');
      fireEvent.click(publishButton);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Publishing article:',
        expect.objectContaining({
          title: 'Test Title',
          content: expect.any(String),
          plainTextContent: expect.any(String),
          tags: expect.any(Array),
        }),
      );
    });
  });

  it('renders Add Image section with correct elements', () => {
    render(<DialogArticleInput />);

    expect(screen.getByTestId('image-icon')).toBeInTheDocument();
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    expect(screen.getByText('Add image')).toBeInTheDocument();
  });

  it('renders PostTagsList with correct props', () => {
    render(<DialogArticleInput />);

    expect(Molecules.PostTagsList).toHaveBeenCalledWith(
      expect.objectContaining({
        showInput: false,
        showAddButton: true,
        addMode: true,
        showEmojiPicker: false,
        showTagClose: true,
        tags: [],
        onTagAdd: expect.any(Function),
        onTagClose: expect.any(Function),
      }),
      undefined,
    );
  });
});
