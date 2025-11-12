import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostTagsList } from './PostTagsList';

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
  const mockTags = [
    { label: 'bitcoin', count: 21 },
    { label: 'based', count: 7 },
    { label: 'test', count: 3 },
  ];

  it('renders all tags', () => {
    render(<PostTagsList tags={mockTags} />);

    expect(screen.getByText('bitcoin')).toBeInTheDocument();
    expect(screen.getByText('based')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('calls onTagClick when a tag is clicked', () => {
    const mockOnTagClick = vi.fn();
    render(<PostTagsList tags={mockTags} onTagClick={mockOnTagClick} />);

    const bitcoinTag = screen.getByText('bitcoin').closest('button');
    fireEvent.click(bitcoinTag!);

    expect(mockOnTagClick).toHaveBeenCalledWith(mockTags[0], 0);
  });

  it('calls onTagClose when tag close button is clicked', () => {
    const mockOnTagClose = vi.fn();
    render(<PostTagsList tags={mockTags} showTagClose onTagClose={mockOnTagClose} />);

    const closeButtons = screen.getAllByLabelText(/remove.*tag/i);
    fireEvent.click(closeButtons[0]);

    expect(mockOnTagClose).toHaveBeenCalledWith(mockTags[0], 0);
  });

  it('calls onTagAdd when a new tag is submitted', () => {
    const mockOnTagAdd = vi.fn();
    render(<PostTagsList tags={mockTags} onTagAdd={mockOnTagAdd} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'newtag' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnTagAdd).toHaveBeenCalledWith('newtag');
  });

  it('clears input after submitting a tag', () => {
    const mockOnTagAdd = vi.fn();
    render(<PostTagsList tags={mockTags} onTagAdd={mockOnTagAdd} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'newtag' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(input.value).toBe('');
  });

  it('does not render input when showInput is false', () => {
    render(<PostTagsList tags={mockTags} showInput={false} />);

    const input = screen.queryByRole('textbox');
    expect(input).not.toBeInTheDocument();
  });

  it('renders emoji picker when showEmojiPicker is true', () => {
    render(<PostTagsList tags={mockTags} showEmojiPicker />);

    const emojiButton = screen.getByLabelText(/open emoji picker/i);
    expect(emojiButton).toBeInTheDocument();
  });

  it('calls onEmojiClick when emoji button is clicked', () => {
    const mockOnEmojiClick = vi.fn();
    render(<PostTagsList tags={mockTags} showEmojiPicker onEmojiClick={mockOnEmojiClick} />);

    const emojiButton = screen.getByLabelText(/open emoji picker/i);
    fireEvent.click(emojiButton);

    expect(mockOnEmojiClick).toHaveBeenCalledTimes(1);
  });

  it('toggles from add button to input with addMode', () => {
    render(<PostTagsList tags={mockTags} showInput={false} showAddButton addMode onAddButtonClick={() => {}} />);

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

    // entering value and pressing Enter should keep input open for adding multiple tags (addMode behavior)
    fireEvent.click(screen.getByRole('button', { name: 'Add new tag' }));
    const input2 = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input2, { target: { value: 'new' } });
    fireEvent.keyDown(input2, { key: 'Enter' });
    // after submit in addMode, input stays open so you can add multiple tags in a row
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add new tag' })).not.toBeInTheDocument();
    // input should be cleared and ready for next tag
    expect(input2.value).toBe('');

    // blur with empty value -> should return to button when addMode
    fireEvent.blur(input2);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add new tag' })).toBeInTheDocument();
  });
});

describe('PostTagsList - Snapshots', () => {
  const mockTags = [
    { label: 'bitcoin', count: 21, selected: true },
    { label: 'based', count: 7 },
    { label: 'test', count: 3 },
  ];

  it('matches snapshot with tags and input', () => {
    const { container } = render(<PostTagsList tags={mockTags} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with emoji picker', () => {
    const { container } = render(<PostTagsList tags={mockTags} showEmojiPicker />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with close buttons', () => {
    const { container } = render(<PostTagsList tags={mockTags} showTagClose />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without input', () => {
    const { container } = render(<PostTagsList tags={mockTags} showInput={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty tags', () => {
    const { container } = render(<PostTagsList tags={[]} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
