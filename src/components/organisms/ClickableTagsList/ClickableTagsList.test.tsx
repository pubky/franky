import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClickableTagsList } from './ClickableTagsList';
import * as Core from '@/core';
import type { TagWithAvatars } from '@/molecules/TaggedItem/TaggedItem.types';

// Mock hooks
const mockHandleTagToggle = vi.fn();
const mockHandleTagAdd = vi.fn().mockResolvedValue({ success: true });
const mockIsViewerTagger = vi.fn((tag: TagWithAvatars) => tag.relationship ?? false);

vi.mock('@/hooks', () => ({
  useEntityTags: vi.fn((_entityId, _taggedKind, options) => ({
    tags: options?.providedTags ?? [],
    count: options?.providedTags?.length ?? 0,
    isLoading: false,
    isViewerTagger: mockIsViewerTagger,
    handleTagToggle: mockHandleTagToggle,
    handleTagAdd: mockHandleTagAdd,
  })),
  useTagInput: vi.fn(({ onTagAdd }) => ({
    inputValue: '',
    setInputValue: vi.fn(),
    handleTagSubmit: vi.fn(() => onTagAdd?.('new-tag')),
  })),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  PostTag: ({
    label,
    count,
    selected,
    showClose,
    onClick,
    onClose,
  }: {
    label: string;
    count?: number;
    selected?: boolean;
    showClose?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    onClose?: (e: React.MouseEvent) => void;
  }) => (
    <button data-testid={`post-tag-${label}`} data-selected={selected} data-count={count} onClick={onClick}>
      {label}
      {showClose && (
        <span data-testid={`close-${label}`} onClick={onClose}>
          ×
        </span>
      )}
    </button>
  ),
  PostTagInput: ({
    value,
    onChange,
    onSubmit,
  }: {
    value: string;
    onChange: (v: string) => void;
    onSubmit: () => void;
  }) => (
    <input
      data-testid="post-tag-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
    />
  ),
  PostTagAddButton: ({ onClick }: { onClick: () => void }) => (
    <button data-testid="post-tag-add-button" onClick={onClick}>
      Add
    </button>
  ),
}));

// Mock libs
vi.mock('@/libs', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
  truncateString: (str: string, max: number) => (str.length > max ? `${str.slice(0, max)}...` : str),
  generateRandomColor: () => '#ff0000',
  getDisplayTags: (labels: string[]) => labels,
}));

describe('ClickableTagsList', () => {
  const mockTags: Core.NexusTag[] = [
    { label: 'bitcoin', taggers_count: 5, taggers: ['user1', 'user2'], relationship: true },
    { label: 'ethereum', taggers_count: 3, taggers: ['user3'], relationship: false },
    { label: 'crypto', taggers_count: 10, taggers: [], relationship: false },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsViewerTagger.mockImplementation((tag: TagWithAvatars) => tag.relationship ?? false);
  });

  describe('Rendering', () => {
    it('renders correctly with tags', () => {
      render(<ClickableTagsList taggedId="post-123" taggedKind={Core.TagKind.POST} tags={mockTags} />);

      expect(screen.getByTestId('post-tag-bitcoin')).toBeInTheDocument();
      expect(screen.getByTestId('post-tag-ethereum')).toBeInTheDocument();
      expect(screen.getByTestId('post-tag-crypto')).toBeInTheDocument();
    });

    it('returns null when no tags and no input/button', () => {
      const { container } = render(<ClickableTagsList taggedId="post-123" taggedKind={Core.TagKind.POST} tags={[]} />);

      expect(container.firstChild).toBeNull();
    });

    it('shows tag count when showCount is true', () => {
      render(<ClickableTagsList taggedId="post-123" taggedKind={Core.TagKind.POST} tags={mockTags} showCount={true} />);

      expect(screen.getByTestId('post-tag-bitcoin')).toHaveAttribute('data-count', '5');
    });

    it('hides tag count when showCount is false', () => {
      render(
        <ClickableTagsList taggedId="post-123" taggedKind={Core.TagKind.POST} tags={mockTags} showCount={false} />,
      );

      expect(screen.getByTestId('post-tag-bitcoin')).not.toHaveAttribute('data-count');
    });

    it('shows selected state for viewer tags', () => {
      render(<ClickableTagsList taggedId="post-123" taggedKind={Core.TagKind.POST} tags={mockTags} />);

      expect(screen.getByTestId('post-tag-bitcoin')).toHaveAttribute('data-selected', 'true');
      expect(screen.getByTestId('post-tag-ethereum')).toHaveAttribute('data-selected', 'false');
    });

    it('shows close button when showTagClose is true', () => {
      render(
        <ClickableTagsList taggedId="post-123" taggedKind={Core.TagKind.POST} tags={mockTags} showTagClose={true} />,
      );

      expect(screen.getByTestId('close-bitcoin')).toBeInTheDocument();
    });
  });

  describe('Input visibility', () => {
    it('shows input when showInput is true', () => {
      render(<ClickableTagsList taggedId="post-123" taggedKind={Core.TagKind.POST} tags={mockTags} showInput={true} />);

      expect(screen.getByTestId('post-tag-input')).toBeInTheDocument();
    });

    it('hides input when showInput is false', () => {
      render(
        <ClickableTagsList taggedId="post-123" taggedKind={Core.TagKind.POST} tags={mockTags} showInput={false} />,
      );

      expect(screen.queryByTestId('post-tag-input')).not.toBeInTheDocument();
    });

    it('shows add button when showAddButton is true and no input', () => {
      render(
        <ClickableTagsList
          taggedId="post-123"
          taggedKind={Core.TagKind.POST}
          tags={mockTags}
          showAddButton={true}
          showInput={false}
        />,
      );

      expect(screen.getByTestId('post-tag-add-button')).toBeInTheDocument();
    });

    it('hides add button when showInput is true', () => {
      render(
        <ClickableTagsList
          taggedId="post-123"
          taggedKind={Core.TagKind.POST}
          tags={mockTags}
          showAddButton={true}
          showInput={true}
        />,
      );

      expect(screen.queryByTestId('post-tag-add-button')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls handleTagToggle when tag is clicked without custom handler', () => {
      render(<ClickableTagsList taggedId="post-123" taggedKind={Core.TagKind.POST} tags={mockTags} />);

      fireEvent.click(screen.getByTestId('post-tag-bitcoin'));

      expect(mockHandleTagToggle).toHaveBeenCalled();
    });

    it('calls custom onTagClick when provided', () => {
      const customHandler = vi.fn();
      render(
        <ClickableTagsList
          taggedId="post-123"
          taggedKind={Core.TagKind.POST}
          tags={mockTags}
          onTagClick={customHandler}
        />,
      );

      fireEvent.click(screen.getByTestId('post-tag-bitcoin'));

      expect(customHandler).toHaveBeenCalled();
      expect(mockHandleTagToggle).not.toHaveBeenCalled();
    });

    it('calls onTagClose when close button is clicked', () => {
      const closeHandler = vi.fn();
      render(
        <ClickableTagsList
          taggedId="post-123"
          taggedKind={Core.TagKind.POST}
          tags={mockTags}
          showTagClose={true}
          onTagClose={closeHandler}
        />,
      );

      fireEvent.click(screen.getByTestId('close-bitcoin'));

      expect(closeHandler).toHaveBeenCalled();
    });

    it('calls onAddButtonClick when add button is clicked', () => {
      const addButtonHandler = vi.fn();
      render(
        <ClickableTagsList
          taggedId="post-123"
          taggedKind={Core.TagKind.POST}
          tags={mockTags}
          showAddButton={true}
          onAddButtonClick={addButtonHandler}
        />,
      );

      fireEvent.click(screen.getByTestId('post-tag-add-button'));

      expect(addButtonHandler).toHaveBeenCalled();
    });
  });

  describe('Add mode', () => {
    it('shows input when add button is clicked in addMode', () => {
      render(
        <ClickableTagsList
          taggedId="post-123"
          taggedKind={Core.TagKind.POST}
          tags={mockTags}
          showAddButton={true}
          addMode={true}
        />,
      );

      expect(screen.queryByTestId('post-tag-input')).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId('post-tag-add-button'));

      expect(screen.getByTestId('post-tag-input')).toBeInTheDocument();
    });
  });

  describe('TagKind support', () => {
    it('works with USER tags', () => {
      render(<ClickableTagsList taggedId="user-123" taggedKind={Core.TagKind.USER} tags={mockTags} />);

      expect(screen.getByTestId('post-tag-bitcoin')).toBeInTheDocument();
    });

    it('works with POST tags', () => {
      render(<ClickableTagsList taggedId="post-123" taggedKind={Core.TagKind.POST} tags={mockTags} />);

      expect(screen.getByTestId('post-tag-bitcoin')).toBeInTheDocument();
    });
  });

  describe('Snapshots', () => {
    it('matches snapshot with tags and count', () => {
      const { container } = render(
        <ClickableTagsList taggedId="post-123" taggedKind={Core.TagKind.POST} tags={mockTags} showCount={true} />,
      );

      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with input visible', () => {
      const { container } = render(
        <ClickableTagsList
          taggedId="post-123"
          taggedKind={Core.TagKind.POST}
          tags={mockTags}
          showInput={true}
          showEmojiPicker={true}
        />,
      );

      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with add button', () => {
      const { container } = render(
        <ClickableTagsList taggedId="post-123" taggedKind={Core.TagKind.POST} tags={mockTags} showAddButton={true} />,
      );

      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with close buttons', () => {
      const { container } = render(
        <ClickableTagsList taggedId="post-123" taggedKind={Core.TagKind.POST} tags={mockTags} showTagClose={true} />,
      );

      expect(container).toMatchSnapshot();
    });
  });
});
