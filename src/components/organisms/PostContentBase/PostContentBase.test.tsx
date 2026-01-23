import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostContentBase } from './PostContentBase';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';

// Mock next/navigation for usePathname used by PostText
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

// Mock hooks used by PostContentBase
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    usePostDetails: vi.fn(),
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
  PostText: vi.fn(() => null),
  PostLinkEmbeds: vi.fn(() => null),
}));

// Mock organisms - PostAttachments, PostContentBlurred
vi.mock('@/organisms', () => ({
  PostAttachments: vi.fn(() => <div data-testid="post-attachments" />),
  PostContentBlurred: vi.fn(() => <div data-testid="post-content-blurred" />),
}));

const mockUsePostDetails = vi.mocked(Hooks.usePostDetails);
const mockPostAttachments = vi.mocked(Organisms.PostAttachments);
const mockPostContentBlurred = vi.mocked(Organisms.PostContentBlurred);

// Helper to create complete PostDetails mock
const createMockPostDetails = (
  overrides: Partial<{ content: string; attachments: string[] | null; is_blurred: boolean; kind: string }> = {},
) => ({
  id: 'test-author:test-post',
  indexed_at: Date.now(),
  kind: 'short' as string,
  uri: 'pubky://test-author/pub/pubky.app/posts/test-post',
  content: 'Mock content',
  attachments: null as string[] | null,
  is_blurred: false,
  is_moderated: false,
  ...overrides,
});

const mockPostText = vi.mocked(Molecules.PostText);

describe('PostContentBase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePostDetails.mockReturnValue({
      postDetails: createMockPostDetails(),
      isLoading: false,
    });
  });

  it('renders content when postDetails are available', () => {
    render(<PostContentBase postId="post-123" />);

    expect(screen.getByTestId('container')).toBeInTheDocument();
  });

  it('calls PostAttachments with attachments from postDetails', () => {
    const mockAttachments = ['file-id-1', 'file-id-2'];
    mockUsePostDetails.mockReturnValue({
      postDetails: createMockPostDetails({ content: 'Test content', attachments: mockAttachments }),
      isLoading: false,
    });

    render(<PostContentBase postId="post-123" />);

    expect(mockPostAttachments).toHaveBeenCalledWith({ attachments: mockAttachments }, undefined);
  });

  it('calls PostAttachments with null when no attachments', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: createMockPostDetails({ content: 'Test content' }),
      isLoading: false,
    });

    render(<PostContentBase postId="post-123" />);

    expect(mockPostAttachments).toHaveBeenCalledWith({ attachments: null }, undefined);
  });

  it('calls PostAttachments with empty array', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: createMockPostDetails({ content: 'Test content', attachments: [] }),
      isLoading: false,
    });

    render(<PostContentBase postId="post-123" />);

    expect(mockPostAttachments).toHaveBeenCalledWith({ attachments: [] }, undefined);
  });

  it('renders PostContentBlurred when is_blurred is true', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: createMockPostDetails({ content: 'Test content', is_blurred: true }),
      isLoading: false,
    });

    render(<PostContentBase postId="post-123" className="custom-class" />);

    expect(screen.getByTestId('post-content-blurred')).toBeInTheDocument();
    expect(mockPostContentBlurred).toHaveBeenCalledWith({ postId: 'post-123', className: 'custom-class' }, undefined);
    expect(mockPostAttachments).not.toHaveBeenCalled();
  });

  it('renders normal content when is_blurred is false', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: createMockPostDetails({ content: 'Test content', is_blurred: false }),
      isLoading: false,
    });

    render(<PostContentBase postId="post-123" />);

    expect(screen.queryByTestId('post-content-blurred')).not.toBeInTheDocument();
    expect(screen.getByTestId('container')).toBeInTheDocument();
  });

  describe('Article mode (long posts)', () => {
    it('passes isArticle=true to PostText when post kind is "long"', () => {
      mockUsePostDetails.mockReturnValue({
        postDetails: createMockPostDetails({ content: 'Article content', kind: 'long' }),
        isLoading: false,
      });

      render(<PostContentBase postId="article-123" />);

      expect(mockPostText).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Article content',
          isArticle: true,
        }),
        undefined,
      );
    });

    it('passes isArticle=false to PostText when post kind is "short"', () => {
      mockUsePostDetails.mockReturnValue({
        postDetails: createMockPostDetails({ content: 'Short content', kind: 'short' }),
        isLoading: false,
      });

      render(<PostContentBase postId="short-123" />);

      expect(mockPostText).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Short content',
          isArticle: false,
        }),
        undefined,
      );
    });

    it('passes isArticle=false to PostText when post kind is "image"', () => {
      mockUsePostDetails.mockReturnValue({
        postDetails: createMockPostDetails({ content: 'Image caption', kind: 'image' }),
        isLoading: false,
      });

      render(<PostContentBase postId="image-123" />);

      expect(mockPostText).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Image caption',
          isArticle: false,
        }),
        undefined,
      );
    });

    it('does not pass isArticle to PostText when content is empty', () => {
      mockUsePostDetails.mockReturnValue({
        postDetails: createMockPostDetails({ content: '', kind: 'long' }),
        isLoading: false,
      });

      render(<PostContentBase postId="empty-123" />);

      // PostText should not be called when content is empty
      expect(mockPostText).not.toHaveBeenCalled();
    });
  });
});

describe('PostContentBase - Snapshots', () => {
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
    mockUsePostDetails.mockReturnValue({
      postDetails: createMockPostDetails({ content: 'One liner' }),
      isLoading: false,
    });

    const { container } = render(<PostContentBase postId="post-1" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with multiline content (preserves newlines)', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: createMockPostDetails({ content: 'Line 1\nLine 2\n\nLine 3' }),
      isLoading: false,
    });

    const { container } = render(<PostContentBase postId="post-2" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty content', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: createMockPostDetails({ content: '' }),
      isLoading: false,
    });

    const { container } = render(<PostContentBase postId="post-3" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with loading state', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: null,
      isLoading: true,
    });

    const { container } = render(<PostContentBase postId="post-loading" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with very long content', () => {
    const longContent = 'A'.repeat(1000) + ' ' + 'B'.repeat(1000);
    mockUsePostDetails.mockReturnValue({
      postDetails: createMockPostDetails({ content: longContent }),
      isLoading: false,
    });

    const { container } = render(<PostContentBase postId="post-5" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with special characters in content', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: createMockPostDetails({ content: 'Content with <tags> & "quotes" & \'apostrophes\'' }),
      isLoading: false,
    });

    const { container } = render(<PostContentBase postId="post-6" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with article content (kind=long)', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: createMockPostDetails({
        content:
          '# Article Title\n\nThis is an article with a [link](https://example.com).\n\n## Section One\n\nMore content here.',
        kind: 'long',
      }),
      isLoading: false,
    });

    const { container } = render(<PostContentBase postId="article-1" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
