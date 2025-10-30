import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostContent } from './PostContent';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

// Mock core model used by PostContent
vi.mock('@/core', () => ({
  PostDetailsModel: {
    findById: vi.fn().mockResolvedValue({ content: 'Mock content' }),
  },
}));

const mockUseLiveQuery = vi.mocked(useLiveQuery);
const mockFindById = vi.mocked(Core.PostDetailsModel.findById);

describe('PostContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders content when postDetails are available', () => {
    const mockPostDetails = { content: 'Feed post content' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    render(<PostContent postId="post-123" />);

    expect(screen.getByText('Feed post content')).toBeInTheDocument();
  });

  it('shows loading when postDetails are not yet available', () => {
    mockUseLiveQuery.mockReturnValue(null);

    const { container } = render(<PostContent postId="post-123" />);

    expect(container.firstChild).toHaveTextContent('Loading content...');
  });

  it('calls PostDetailsModel.findById with correct id', async () => {
    const mockPostDetails = { content: 'Hello' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    render(<PostContent postId="post-abc" />);

    // The useLiveQuery callback is the first argument of the first call
    const callback = mockUseLiveQuery.mock.calls[0][0] as () => Promise<unknown>;
    await callback();

    expect(mockFindById).toHaveBeenCalledWith('post-abc');
  });
});

describe('PostContent - Snapshots', () => {
  it('matches snapshot with single-line content', () => {
    const mockPostDetails = { content: 'One liner' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    const { container } = render(<PostContent postId="post-1" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with multiline content (preserves newlines)', () => {
    const mockPostDetails = { content: 'Line 1\nLine 2\n\nLine 3' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    const { container } = render(<PostContent postId="post-2" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty content', () => {
    const mockPostDetails = { content: '' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    const { container } = render(<PostContent postId="post-3" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
