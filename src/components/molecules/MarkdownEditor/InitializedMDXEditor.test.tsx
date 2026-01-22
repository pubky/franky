import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createRef } from 'react';
import type { MDXEditorMethods } from '@mdxeditor/editor';
import InitializedMDXEditor from './InitializedMDXEditor';

// Mock config - use a smaller value for easier testing
const MOCK_MAX_LENGTH = 1000;
vi.mock('@/config', () => ({
  ARTICLE_MAX_CHARACTER_LENGTH: 1000,
}));

// Store toolbar contents renderer to invoke it during tests
let toolbarContentsRenderer: (() => React.ReactNode) | null = null;
// Store onChange handler to invoke it during tests
let capturedOnChange: ((markdown: string, initialMarkdownNormalize?: boolean) => void) | null = null;

// Mock @mdxeditor/editor
vi.mock('@mdxeditor/editor', () => {
  const MockMDXEditor = vi.fn(
    ({ placeholder, className, contentEditableClassName, plugins, onChange, ...props }: Record<string, unknown>) => {
      // Capture onChange handler for testing
      capturedOnChange = onChange as typeof capturedOnChange;

      // Find and render toolbar contents if available
      const toolbarContent = toolbarContentsRenderer ? toolbarContentsRenderer() : null;

      return (
        <div
          data-testid="mdx-editor"
          data-placeholder={placeholder}
          className={className}
          data-content-editable-class={contentEditableClassName}
          data-plugins-count={plugins?.length}
          {...props}
        >
          {toolbarContent && <div data-testid="toolbar">{toolbarContent}</div>}
          <div data-testid="editor-content">Editor Content</div>
        </div>
      );
    },
  );

  return {
    MDXEditor: MockMDXEditor,
    toolbarPlugin: vi.fn((config: { toolbarContents: () => React.ReactNode }) => {
      toolbarContentsRenderer = config.toolbarContents;
      return { type: 'toolbar' };
    }),
    headingsPlugin: vi.fn(() => ({ type: 'headings' })),
    quotePlugin: vi.fn(() => ({ type: 'quote' })),
    listsPlugin: vi.fn(() => ({ type: 'lists' })),
    thematicBreakPlugin: vi.fn(() => ({ type: 'thematicBreak' })),
    linkPlugin: vi.fn(() => ({ type: 'link' })),
    codeBlockPlugin: vi.fn(() => ({ type: 'codeBlock' })),
    codeMirrorPlugin: vi.fn(() => ({ type: 'codeMirror' })),
    maxLengthPlugin: vi.fn(() => ({ type: 'maxLength' })),
    BlockTypeSelect: () => <button data-testid="block-type-select">Block Type</button>,
    BoldItalicUnderlineToggles: () => <button data-testid="bold-italic-toggles">Bold/Italic</button>,
    ButtonWithTooltip: ({
      children,
      title,
      onClick,
    }: {
      children: React.ReactNode;
      title: string;
      onClick: () => void;
    }) => (
      <button data-testid="button-with-tooltip" title={title} onClick={onClick}>
        {children}
      </button>
    ),
    CodeToggle: () => <button data-testid="code-toggle">Code</button>,
    InsertCodeBlock: () => <button data-testid="insert-code-block">Insert Code Block</button>,
    InsertThematicBreak: () => <button data-testid="insert-thematic-break">Insert Break</button>,
    ListsToggle: () => <button data-testid="lists-toggle">Lists</button>,
    StrikeThroughSupSubToggles: () => <button data-testid="strikethrough-toggle">Strikethrough</button>,
    UndoRedo: () => <button data-testid="undo-redo">Undo/Redo</button>,
  };
});

// Mock @codemirror/theme-one-dark
vi.mock('@codemirror/theme-one-dark', () => ({
  oneDark: {},
}));

// Mock @codemirror/language-data
vi.mock('@codemirror/language-data', () => ({
  languages: [
    { name: 'JavaScript', alias: ['js'], load: vi.fn().mockResolvedValue({}) },
    { name: 'TypeScript', alias: ['ts'], load: vi.fn().mockResolvedValue({}) },
    { name: 'Python', load: vi.fn().mockResolvedValue({}) },
  ],
}));

// Store onEmojiSelect callback for testing
let capturedOnEmojiSelect: ((emoji: { native: string }) => void) | null = null;

// Mock EmojiPickerDialog
vi.mock('@/components/molecules', () => ({
  EmojiPickerDialog: ({
    open,
    onOpenChange,
    onEmojiSelect,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEmojiSelect: (emoji: { native: string }) => void;
  }) => {
    // Capture the callback for testing
    capturedOnEmojiSelect = onEmojiSelect;
    if (!open) return null;
    return (
      <div data-testid="emoji-picker-dialog">
        <button
          data-testid="emoji-select-button"
          onClick={() => {
            // Match real EmojiPickerDialog behavior: call onEmojiSelect then close
            onEmojiSelect({ native: '🎉' });
            onOpenChange(false);
          }}
        >
          Select Emoji
        </button>
      </div>
    );
  },
}));

// Mock icons
vi.mock('@/libs/icons', () => ({
  Smile: ({ className }: { className?: string }) => (
    <svg data-testid="smile-icon" className={className}>
      <title>Smile</title>
    </svg>
  ),
  AlertTriangle: ({ className }: { className?: string }) => (
    <svg data-testid="alert-triangle-icon" className={className}>
      <title>Alert Triangle</title>
    </svg>
  ),
}));

// Mock @/atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  Typography: ({
    children,
    className,
    overrideDefaults,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    overrideDefaults?: boolean;
  }) => (
    <span className={className} data-override-defaults={overrideDefaults} {...props}>
      {children}
    </span>
  ),
}));

// Mock @/libs/utils
vi.mock('@/libs/utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('InitializedMDXEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    toolbarContentsRenderer = null;
    capturedOnEmojiSelect = null;
    capturedOnChange = null;
  });

  it('renders the MDXEditor component', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    expect(screen.getByTestId('mdx-editor')).toBeInTheDocument();
  });

  it('renders with correct placeholder text', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    const editor = screen.getByTestId('mdx-editor');
    expect(editor).toHaveAttribute('data-placeholder', 'Start writing your masterpiece');
  });

  it('renders with correct CSS classes', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    const editor = screen.getByTestId('mdx-editor');
    expect(editor).toHaveClass('dark-theme');
    expect(editor).toHaveClass('cursor-auto');
  });

  it('applies contentEditableClassName with prose styles', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    const editor = screen.getByTestId('mdx-editor');
    const contentEditableClass = editor.getAttribute('data-content-editable-class');
    expect(contentEditableClass).toContain('prose');
    expect(contentEditableClass).toContain('prose-neutral');
    expect(contentEditableClass).toContain('prose-invert');
  });

  it('configures plugins correctly', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    const editor = screen.getByTestId('mdx-editor');
    // The editor should have 9 plugins configured
    expect(editor).toHaveAttribute('data-plugins-count', '9');
  });

  it('passes additional props to MDXEditor', () => {
    render(<InitializedMDXEditor editorRef={null} markdown="# Hello World" />);

    const editor = screen.getByTestId('mdx-editor');
    expect(editor).toHaveAttribute('markdown', '# Hello World');
  });

  it('renders toolbar with all controls', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('undo-redo')).toBeInTheDocument();
    expect(screen.getByTestId('block-type-select')).toBeInTheDocument();
    expect(screen.getByTestId('bold-italic-toggles')).toBeInTheDocument();
    expect(screen.getByTestId('strikethrough-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('lists-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('insert-thematic-break')).toBeInTheDocument();
    expect(screen.getByTestId('code-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('insert-code-block')).toBeInTheDocument();
  });

  it('does not show emoji picker dialog initially', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    expect(screen.queryByTestId('emoji-picker-dialog')).not.toBeInTheDocument();
  });

  it('opens emoji picker dialog when emoji button is clicked', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    const emojiButton = screen.getByTestId('button-with-tooltip');
    fireEvent.click(emojiButton);

    expect(screen.getByTestId('emoji-picker-dialog')).toBeInTheDocument();
  });

  it('renders smile icon in emoji button', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    const smileIcon = screen.getByTestId('smile-icon');
    expect(smileIcon).toBeInTheDocument();
    expect(smileIcon).toHaveClass('size-6');
  });

  it('emoji button has correct tooltip title', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    const emojiButton = screen.getByTestId('button-with-tooltip');
    expect(emojiButton).toHaveAttribute('title', 'Emoji');
  });

  it('accepts a ref for editor methods', () => {
    const editorRef = createRef<MDXEditorMethods>();
    render(<InitializedMDXEditor editorRef={editorRef} />);

    expect(screen.getByTestId('mdx-editor')).toBeInTheDocument();
  });

  it('provides onEmojiSelect callback to EmojiPickerDialog', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    // Open emoji picker to trigger the callback capture
    const emojiButton = screen.getByTestId('button-with-tooltip');
    fireEvent.click(emojiButton);

    // Verify callback was captured (component properly passed it)
    expect(capturedOnEmojiSelect).toBeDefined();
    expect(typeof capturedOnEmojiSelect).toBe('function');
  });

  it('closes emoji picker dialog after selecting emoji', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    // Open emoji picker
    const emojiButton = screen.getByTestId('button-with-tooltip');
    fireEvent.click(emojiButton);
    expect(screen.getByTestId('emoji-picker-dialog')).toBeInTheDocument();

    // Select an emoji - dialog closes (EmojiPickerDialog calls onOpenChange(false))
    const selectEmojiButton = screen.getByTestId('emoji-select-button');
    fireEvent.click(selectEmojiButton);

    // Dialog should be closed
    expect(screen.queryByTestId('emoji-picker-dialog')).not.toBeInTheDocument();
  });

  it('does not show max length warning initially', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    expect(screen.queryByTestId('max-length-warning')).not.toBeInTheDocument();
  });

  it('shows approaching warning when less than 100 characters remaining', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    // Simulate typing content that leaves 99 characters remaining
    const contentLength = MOCK_MAX_LENGTH - 99;
    act(() => {
      capturedOnChange?.('a'.repeat(contentLength));
    });

    const warning = screen.getByTestId('max-length-warning');
    expect(warning).toBeInTheDocument();
    expect(warning).toHaveClass('bg-yellow-500/15');
    expect(warning).toHaveClass('text-yellow-500');
    expect(screen.getByText("You're approaching the maximum character limit.")).toBeInTheDocument();
  });

  it('shows reached warning when at maximum length', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    // Simulate typing content that reaches exactly the max length
    act(() => {
      capturedOnChange?.('a'.repeat(MOCK_MAX_LENGTH));
    });

    const warning = screen.getByTestId('max-length-warning');
    expect(warning).toBeInTheDocument();
    expect(warning).toHaveClass('bg-red-500/15');
    expect(warning).toHaveClass('text-red-500');
    expect(screen.getByText("You've reached the maximum character limit.")).toBeInTheDocument();
  });

  it('clears warning when content is reduced below threshold', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    // First, trigger the warning
    act(() => {
      capturedOnChange?.('a'.repeat(MOCK_MAX_LENGTH - 50));
    });
    expect(screen.getByTestId('max-length-warning')).toBeInTheDocument();

    // Then reduce content to clear warning (more than 100 chars remaining)
    act(() => {
      capturedOnChange?.('a'.repeat(MOCK_MAX_LENGTH - 150));
    });
    expect(screen.queryByTestId('max-length-warning')).not.toBeInTheDocument();
  });

  it('calls props.onChange when provided', () => {
    const mockOnChange = vi.fn();
    render(<InitializedMDXEditor editorRef={null} onChange={mockOnChange} />);

    const testMarkdown = '# Test content';
    act(() => {
      capturedOnChange?.(testMarkdown);
    });

    expect(mockOnChange).toHaveBeenCalledWith(testMarkdown, undefined);
  });

  it('renders alert triangle icon in max length warning', () => {
    render(<InitializedMDXEditor editorRef={null} />);

    // Trigger the warning
    act(() => {
      capturedOnChange?.('a'.repeat(MOCK_MAX_LENGTH - 50));
    });

    const alertIcon = screen.getByTestId('alert-triangle-icon');
    expect(alertIcon).toBeInTheDocument();
    expect(alertIcon).toHaveClass('size-4');
    expect(alertIcon).toHaveClass('shrink-0');
  });
});

describe('InitializedMDXEditor - Snapshots', () => {
  beforeEach(() => {
    toolbarContentsRenderer = null;
    capturedOnEmojiSelect = null;
    capturedOnChange = null;
  });

  it('matches snapshot with default props', () => {
    const { container } = render(<InitializedMDXEditor editorRef={null} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with markdown content', () => {
    const { container } = render(<InitializedMDXEditor editorRef={null} markdown="# Test Content" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with emoji picker open', () => {
    const { container } = render(<InitializedMDXEditor editorRef={null} />);

    const emojiButton = screen.getByTestId('button-with-tooltip');
    fireEvent.click(emojiButton);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<InitializedMDXEditor editorRef={null} className="custom-editor-class" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with approaching max length warning', () => {
    const { container } = render(<InitializedMDXEditor editorRef={null} />);

    // Trigger approaching warning
    act(() => {
      capturedOnChange?.('a'.repeat(MOCK_MAX_LENGTH - 50));
    });

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with reached max length warning', () => {
    const { container } = render(<InitializedMDXEditor editorRef={null} />);

    // Trigger reached warning
    act(() => {
      capturedOnChange?.('a'.repeat(MOCK_MAX_LENGTH));
    });

    expect(container).toMatchSnapshot();
  });
});
