import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SinglePostCounts } from './SinglePostCounts';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

// Mock the atoms
vi.mock('@/atoms', () => ({
  Container: vi.fn(({ children, className }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  )),
  Button: vi.fn(({ children, className, onClick, variant, size }) => (
    <button data-testid="button" className={className} onClick={onClick} data-variant={variant} data-size={size}>
      {children}
    </button>
  )),
  Typography: vi.fn(({ children, size }) => (
    <span data-testid="typography" data-size={size}>
      {children}
    </span>
  )),
}));

// Mock @/libs - use actual implementations
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
  };
});

// Mock the core
vi.mock('@/core', () => ({
  db: {
    post_counts: {
      get: vi.fn().mockResolvedValue({ tags: 0, replies: 0, reposts: 0 }),
    },
  },
}));

const mockUseLiveQuery = vi.mocked(useLiveQuery);
const mockDbGet = vi.mocked(Core.db.post_counts.get);

// Mock console.log
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('SinglePostCounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays correct counts from countsData', () => {
    const mockCountsData = { tags: 3, replies: 7, reposts: 1 };
    mockUseLiveQuery.mockReturnValue(mockCountsData);

    render(<SinglePostCounts postId="test-post-123" />);

    const typographyElements = screen.getAllByTestId('typography');
    expect(typographyElements[0]).toHaveTextContent('3'); // tags
    expect(typographyElements[1]).toHaveTextContent('7'); // replies
    expect(typographyElements[2]).toHaveTextContent('1'); // reposts
  });

  it('renders with default counts when countsData is null', () => {
    mockUseLiveQuery.mockReturnValue(null);

    render(<SinglePostCounts postId="test-post-123" />);

    const typographyElements = screen.getAllByTestId('typography');
    expect(typographyElements[0]).toHaveTextContent('0'); // tags
    expect(typographyElements[1]).toHaveTextContent('0'); // replies
    expect(typographyElements[2]).toHaveTextContent('0'); // reposts
  });

  it('renders with default counts when countsData is undefined', () => {
    mockUseLiveQuery.mockReturnValue(undefined);

    render(<SinglePostCounts postId="test-post-123" />);

    const typographyElements = screen.getAllByTestId('typography');
    expect(typographyElements[0]).toHaveTextContent('0'); // tags
    expect(typographyElements[1]).toHaveTextContent('0'); // replies
    expect(typographyElements[2]).toHaveTextContent('0'); // reposts
  });

  it('renders all required icons', () => {
    const mockCountsData = { tags: 1, replies: 1, reposts: 1 };
    mockUseLiveQuery.mockReturnValue(mockCountsData);

    render(<SinglePostCounts postId="test-post-123" />);

    // Check that icons are rendered (they will be actual SVG elements from @/libs)
    const buttons = screen.getAllByTestId('button');
    expect(buttons).toHaveLength(5);

    // Each button should contain an icon (SVG element)
    buttons.forEach((button) => {
      const svgElement = button.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });
  });

  it('handles repost button click', () => {
    const mockCountsData = { tags: 1, replies: 1, reposts: 1 };
    mockUseLiveQuery.mockReturnValue(mockCountsData);

    render(<SinglePostCounts postId="test-post-123" />);

    const buttons = screen.getAllByTestId('button');
    const repostButton = buttons[2]; // Third button is repost
    fireEvent.click(repostButton);

    expect(mockConsoleLog).toHaveBeenCalledWith('TODO: repost', 'test-post-123');
  });

  it('handles bookmark button click', () => {
    const mockCountsData = { tags: 1, replies: 1, reposts: 1 };
    mockUseLiveQuery.mockReturnValue(mockCountsData);

    render(<SinglePostCounts postId="test-post-123" />);

    const buttons = screen.getAllByTestId('button');
    const bookmarkButton = buttons[3]; // Fourth button is bookmark
    fireEvent.click(bookmarkButton);

    expect(mockConsoleLog).toHaveBeenCalledWith('TODO: add to bookmarks', 'test-post-123');
  });

  it('passes postId to useLiveQuery correctly', () => {
    const mockCountsData = { tags: 1, replies: 1, reposts: 1 };
    mockUseLiveQuery.mockReturnValue(mockCountsData);

    render(<SinglePostCounts postId="unique-post-id" />);

    expect(mockUseLiveQuery).toHaveBeenCalledWith(expect.any(Function), ['unique-post-id'], null);
  });

  it('calls Core.db.post_counts.get with correct postId', async () => {
    const mockCountsData = { tags: 1, replies: 1, reposts: 1 };
    mockUseLiveQuery.mockReturnValue(mockCountsData);

    render(<SinglePostCounts postId="test-post-123" />);

    const callback = mockUseLiveQuery.mock.calls[0][0];
    await callback();

    expect(mockDbGet).toHaveBeenCalledWith('test-post-123');
  });

  it('handles different postId values', () => {
    const mockCountsData = { tags: 1, replies: 1, reposts: 1 };
    mockUseLiveQuery.mockReturnValue(mockCountsData);

    const { rerender } = render(<SinglePostCounts postId="post-1" />);
    expect(mockUseLiveQuery).toHaveBeenCalledWith(expect.any(Function), ['post-1'], null);

    rerender(<SinglePostCounts postId="post-2" />);
    expect(mockUseLiveQuery).toHaveBeenCalledWith(expect.any(Function), ['post-2'], null);
  });
});

describe('SinglePostCounts - Snapshots', () => {
  it('matches snapshot with counts data', () => {
    const mockCountsData = { tags: 5, replies: 10, reposts: 2 };
    mockUseLiveQuery.mockReturnValue(mockCountsData);

    const { container } = render(<SinglePostCounts postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with zero counts', () => {
    const mockCountsData = { tags: 0, replies: 0, reposts: 0 };
    mockUseLiveQuery.mockReturnValue(mockCountsData);

    const { container } = render(<SinglePostCounts postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with large counts', () => {
    const mockCountsData = { tags: 999, replies: 1000, reposts: 500 };
    mockUseLiveQuery.mockReturnValue(mockCountsData);

    const { container } = render(<SinglePostCounts postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with different postId', () => {
    const mockCountsData = { tags: 1, replies: 1, reposts: 1 };
    mockUseLiveQuery.mockReturnValue(mockCountsData);

    const { container } = render(<SinglePostCounts postId="different-post-id" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
