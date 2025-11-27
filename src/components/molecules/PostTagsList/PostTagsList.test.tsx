import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostTagsList } from './PostTagsList';

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(() => [
    {
      id: 'post-123',
      tags: [
        { label: 'bitcoin', taggers_count: 21 },
        { label: 'based', taggers_count: 7 },
        { label: 'test', taggers_count: 3 },
      ],
    },
  ]),
}));

// Mock @/core
vi.mock('@/core', async () => {
  const actual = await vi.importActual('@/core');
  return {
    ...actual,
    useAuthStore: vi.fn((selector) =>
      selector
        ? selector({ currentUserPubky: 'test-pubky-123', selectCurrentUserPubky: () => 'test-pubky-123' })
        : { currentUserPubky: 'test-pubky-123', selectCurrentUserPubky: () => 'test-pubky-123' },
    ),
    PostController: {
      getPostTags: vi.fn().mockResolvedValue([
        {
          id: 'post-123',
          tags: [
            { label: 'bitcoin', taggers_count: 21 },
            { label: 'based', taggers_count: 7 },
            { label: 'test', taggers_count: 3 },
          ],
        },
      ]),
    },
  };
});

// Mock @/libs with partial mock
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    generateRandomColor: vi.fn((str: string) => {
      const colorMap: Record<string, string> = {
        bitcoin: '#FF9900',
        based: '#FF0000',
        test: '#00FF00',
      };
      return colorMap[str.toLowerCase()] || '#FF9900';
    }),
    hexToRgba: vi.fn((hex: string, alpha: number) => {
      const [r, g, b] = hex.match(/\w\w/g)!.map((x) => parseInt(x, 16));
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }),
    X: ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
      <div data-testid="x-icon" className={className} data-stroke-width={strokeWidth}>
        X
      </div>
    ),
    Smile: ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
      <div data-testid="smile-icon" className={className} data-stroke-width={strokeWidth}>
        Smile
      </div>
    ),
  };
});

describe('PostTagsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tags', () => {
    render(<PostTagsList postId="post-123" />);

    expect(screen.getByText('bitcoin')).toBeInTheDocument();
    expect(screen.getByText('based')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('calls onTagClick when a tag is clicked', () => {
    const mockOnTagClick = vi.fn();
    render(<PostTagsList postId="post-123" onTagClick={mockOnTagClick} />);

    const bitcoinTag = screen.getByText('bitcoin').closest('button');
    fireEvent.click(bitcoinTag!);

    expect(mockOnTagClick).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'bitcoin',
        taggers_count: 21, // Verify Core.NexusTag structure (not 'count')
      }),
      0,
      expect.objectContaining({ type: 'click' }),
    );

    // Verify event propagation was stopped
    const event = mockOnTagClick.mock.calls[0][2];
    expect(event.isPropagationStopped()).toBe(true);
  });

  it('calls onTagClose when tag close button is clicked', () => {
    const mockOnTagClose = vi.fn();
    render(<PostTagsList postId="post-123" showTagClose onTagClose={mockOnTagClose} />);

    const closeButtons = screen.getAllByLabelText(/remove.*tag/i);
    fireEvent.click(closeButtons[0]);

    expect(mockOnTagClose).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'bitcoin',
        taggers_count: 21, // Verify Core.NexusTag structure (not 'count')
      }),
      0,
      expect.objectContaining({ type: 'click' }),
    );

    // Verify event propagation was stopped by PostTag component
    const event = mockOnTagClose.mock.calls[0][2];
    expect(event.isPropagationStopped()).toBe(true);
  });

  it('calls onTagAdd when a new tag is submitted', () => {
    const mockOnTagAdd = vi.fn();
    render(<PostTagsList postId="post-123" onTagAdd={mockOnTagAdd} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'newtag' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnTagAdd).toHaveBeenCalledWith('newtag');
  });

  it('clears input after submitting a tag', () => {
    const mockOnTagAdd = vi.fn();
    render(<PostTagsList postId="post-123" onTagAdd={mockOnTagAdd} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'newtag' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(input.value).toBe('');
  });

  it('does not render input when showInput is false', () => {
    render(<PostTagsList postId="post-123" showInput={false} />);

    const input = screen.queryByRole('textbox');
    expect(input).not.toBeInTheDocument();
  });

  it('renders emoji picker when showEmojiPicker is true', () => {
    render(<PostTagsList postId="post-123" showEmojiPicker />);

    const emojiButton = screen.getByLabelText(/open emoji picker/i);
    expect(emojiButton).toBeInTheDocument();
  });

  it('calls onEmojiClick when emoji button is clicked', () => {
    const mockOnEmojiClick = vi.fn();
    render(<PostTagsList postId="post-123" showEmojiPicker onEmojiClick={mockOnEmojiClick} />);

    const emojiButton = screen.getByLabelText(/open emoji picker/i);
    fireEvent.click(emojiButton);

    expect(mockOnEmojiClick).toHaveBeenCalledTimes(1);
  });

  it('toggles from add button to input with addMode', () => {
    render(<PostTagsList postId="post-123" showInput={false} showAddButton addMode onAddButtonClick={() => {}} />);

    // button visible initially
    const addButton = screen.getByLabelText('Add new tag');
    expect(addButton).toBeInTheDocument();

    // click -> should show input and hide button
    fireEvent.click(addButton);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add new tag' })).not.toBeInTheDocument();

    // blur with empty value -> should return to button when addMode
    const input = screen.getByRole('textbox');
    fireEvent.blur(input);
    expect(screen.getByRole('button', { name: 'Add new tag' })).toBeInTheDocument();

    // entering value and pressing Enter should keep button (since value clears)
    fireEvent.click(screen.getByRole('button', { name: 'Add new tag' }));
    const input2 = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input2, { target: { value: 'new' } });
    fireEvent.keyDown(input2, { key: 'Enter' });
    // after submit, value cleared and input remains visible for next add
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('');
  });
});

describe('PostTagsList - Snapshots', () => {
  it('matches snapshot with tags and input', () => {
    const { container } = render(<PostTagsList postId="post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with emoji picker', () => {
    const { container } = render(<PostTagsList postId="post-123" showEmojiPicker />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with close buttons', () => {
    const { container } = render(<PostTagsList postId="post-123" showTagClose />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without input', () => {
    const { container } = render(<PostTagsList postId="post-123" showInput={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty tags', async () => {
    const dexie = await import('dexie-react-hooks');
    vi.mocked(dexie.useLiveQuery).mockReturnValueOnce([]);
    const { container } = render(<PostTagsList postId="post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
