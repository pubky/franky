import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostContent } from './PostContent';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

// Mock core controller used by PostContent
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    PostController: {
      ...actual.PostController,
      getPostDetails: vi.fn().mockResolvedValue({ content: 'Mock content', attachments: null }),
    },
  };
});

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

// Mock molecules - PostText, PostLinkEmbeds
vi.mock('@/molecules', () => ({
  // Return null for easier call assertions
  PostText: vi.fn(() => null),
  PostLinkEmbeds: vi.fn(() => null),
}));

// Mock organisms - PostAttachments
vi.mock('@/organisms', () => ({
  PostAttachments: vi.fn(() => <div data-testid="post-attachments" />),
}));

const mockUseLiveQuery = vi.mocked(useLiveQuery);
const mockGetPostDetails = vi.mocked(Core.PostController.getPostDetails);
const mockPostText = vi.mocked(Molecules.PostText);
const mockPostLinkEmbeds = vi.mocked(Molecules.PostLinkEmbeds);
const mockPostAttachments = vi.mocked(Organisms.PostAttachments);

describe('PostContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to return a default value
    mockGetPostDetails.mockResolvedValue({ content: 'Mock content', attachments: null });
  });

  it('renders content when postDetails are available', () => {
    const mockPostDetails = { content: 'Feed post content' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    render(<PostContent postId="post-123" />);

    expect(screen.getByTestId('container')).toBeInTheDocument();
  });

  it('shows loading when postDetails are not yet available', () => {
    mockUseLiveQuery.mockReturnValue(null);

    const { container } = render(<PostContent postId="post-123" />);

    expect(container.firstChild).toHaveTextContent('Loading content...');
  });

  it('calls PostController.getPostDetails with correct compositeId', async () => {
    const mockPostDetails = { content: 'Hello', attachments: null };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);
    mockGetPostDetails.mockResolvedValue(mockPostDetails);

    render(<PostContent postId="post-abc" />);

    // The useLiveQuery callback is the first argument of the first call
    const callback = mockUseLiveQuery.mock.calls[0][0] as () => Promise<unknown>;
    await callback();

    expect(mockGetPostDetails).toHaveBeenCalledWith({ compositeId: 'post-abc' });
  });

  it('calls PostText with correct content prop', () => {
    const mockPostDetails = { content: 'Test post content' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    render(<PostContent postId="post-123" />);

    expect(mockPostText).toHaveBeenCalledWith({ content: 'Test post content' }, undefined);
  });

  it('calls PostLinkEmbeds with correct content prop', () => {
    const mockPostDetails = { content: 'Test post content' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    render(<PostContent postId="post-123" />);

    expect(mockPostLinkEmbeds).toHaveBeenCalledWith({ content: 'Test post content' }, undefined);
  });

  it('updates query when postId changes', () => {
    const mockPostDetails1 = { content: 'First post' };
    const mockPostDetails2 = { content: 'Second post' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails1);

    const { rerender } = render(<PostContent postId="post-1" />);

    expect(mockUseLiveQuery).toHaveBeenCalledWith(expect.any(Function), expect.arrayContaining(['post-1']));

    mockUseLiveQuery.mockReturnValue(mockPostDetails2);
    rerender(<PostContent postId="post-2" />);

    expect(mockUseLiveQuery).toHaveBeenCalledWith(expect.any(Function), expect.arrayContaining(['post-2']));
  });

  it('calls PostAttachments with attachments from postDetails', () => {
    const mockAttachments = ['file-id-1', 'file-id-2'];
    const mockPostDetails = { content: 'Test content', attachments: mockAttachments };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    render(<PostContent postId="post-123" />);

    expect(mockPostAttachments).toHaveBeenCalledWith({ attachments: mockAttachments }, undefined);
  });

  it('calls PostAttachments with null when no attachments', () => {
    const mockPostDetails = { content: 'Test content', attachments: null };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    render(<PostContent postId="post-123" />);

    expect(mockPostAttachments).toHaveBeenCalledWith({ attachments: null }, undefined);
  });

  it('calls PostAttachments with empty array', () => {
    const mockPostDetails = { content: 'Test content', attachments: [] };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    render(<PostContent postId="post-123" />);

    expect(mockPostAttachments).toHaveBeenCalledWith({ attachments: [] }, undefined);
  });
});

describe('PostContent - Snapshots', () => {
  // Use real PostText and PostLinkEmbeds for snapshot tests
  // PostAttachments remains mocked to avoid useToast dependency chain
  beforeEach(async () => {
    vi.clearAllMocks();
    const actualMolecules = await vi.importActual<typeof import('@/molecules')>('@/molecules');
    // Replace the mock implementations with real ones for snapshots
    vi.mocked(Molecules.PostText).mockImplementation(actualMolecules.PostText);
    vi.mocked(Molecules.PostLinkEmbeds).mockImplementation(actualMolecules.PostLinkEmbeds);
    // PostAttachments stays mocked - it has its own test file
  }, 30000); // Increase timeout to 30 seconds

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

  it('matches snapshot with loading state', () => {
    mockUseLiveQuery.mockReturnValue(null);

    const { container } = render(<PostContent postId="post-loading" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with very long content', () => {
    const longContent = 'A'.repeat(1000) + ' ' + 'B'.repeat(1000);
    const mockPostDetails = { content: longContent };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    const { container } = render(<PostContent postId="post-5" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with special characters in content', () => {
    const mockPostDetails = { content: 'Content with <tags> & "quotes" & \'apostrophes\'' };
    mockUseLiveQuery.mockReturnValue(mockPostDetails);

    const { container } = render(<PostContent postId="post-6" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
