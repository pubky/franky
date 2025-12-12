import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostContentBase } from './PostContentBase';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';

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

// Mock organisms - PostAttachments
vi.mock('@/organisms', () => ({
  PostAttachments: vi.fn(() => <div data-testid="post-attachments" />),
}));

const mockUsePostDetails = vi.mocked(Hooks.usePostDetails);
const mockPostText = vi.mocked(Molecules.PostText);
const mockPostLinkEmbeds = vi.mocked(Molecules.PostLinkEmbeds);
const mockPostAttachments = vi.mocked(Organisms.PostAttachments);

describe('PostContentBase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: 'Mock content', attachments: null },
      isLoading: false,
    });
  });

  it('renders content when postDetails are available', () => {
    render(<PostContentBase postId="post-123" />);

    expect(screen.getByTestId('container')).toBeInTheDocument();
  });

  it('shows loading when postDetails are not yet available', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: null,
      isLoading: true,
    });

    const { container } = render(<PostContentBase postId="post-123" />);

    expect(container.firstChild).toHaveTextContent('Loading content...');
  });

  it('calls usePostDetails with correct id', () => {
    render(<PostContentBase postId="post-abc" />);

    expect(mockUsePostDetails).toHaveBeenCalledWith('post-abc');
  });

  it('calls PostText with correct content prop', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: 'Test post content', attachments: null },
      isLoading: false,
    });

    render(<PostContentBase postId="post-123" />);

    expect(mockPostText).toHaveBeenCalledWith({ content: 'Test post content' }, undefined);
  });

  it('calls PostLinkEmbeds with correct content prop', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: 'Test post content', attachments: null },
      isLoading: false,
    });

    render(<PostContentBase postId="post-123" />);

    expect(mockPostLinkEmbeds).toHaveBeenCalledWith({ content: 'Test post content' }, undefined);
  });

  it('calls PostAttachments with attachments from postDetails', () => {
    const mockAttachments = ['file-id-1', 'file-id-2'];
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: 'Test content', attachments: mockAttachments },
      isLoading: false,
    });

    render(<PostContentBase postId="post-123" />);

    expect(mockPostAttachments).toHaveBeenCalledWith({ attachments: mockAttachments }, undefined);
  });

  it('calls PostAttachments with null when no attachments', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: 'Test content', attachments: null },
      isLoading: false,
    });

    render(<PostContentBase postId="post-123" />);

    expect(mockPostAttachments).toHaveBeenCalledWith({ attachments: null }, undefined);
  });

  it('calls PostAttachments with empty array', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: 'Test content', attachments: [] },
      isLoading: false,
    });

    render(<PostContentBase postId="post-123" />);

    expect(mockPostAttachments).toHaveBeenCalledWith({ attachments: [] }, undefined);
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
    const mockPostDetails = { content: 'One liner' };
    mockUsePostDetails.mockReturnValue({
      postDetails: { ...mockPostDetails, attachments: null },
      isLoading: false,
    });

    const { container } = render(<PostContentBase postId="post-1" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with multiline content (preserves newlines)', () => {
    const mockPostDetails = { content: 'Line 1\nLine 2\n\nLine 3' };
    mockUsePostDetails.mockReturnValue({
      postDetails: { ...mockPostDetails, attachments: null },
      isLoading: false,
    });

    const { container } = render(<PostContentBase postId="post-2" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty content', () => {
    const mockPostDetails = { content: '' };
    mockUsePostDetails.mockReturnValue({
      postDetails: { ...mockPostDetails, attachments: null },
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
    const mockPostDetails = { content: longContent };
    mockUsePostDetails.mockReturnValue({
      postDetails: { ...mockPostDetails, attachments: null },
      isLoading: false,
    });

    const { container } = render(<PostContentBase postId="post-5" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with special characters in content', () => {
    const mockPostDetails = { content: 'Content with <tags> & "quotes" & \'apostrophes\'' };
    mockUsePostDetails.mockReturnValue({
      postDetails: { ...mockPostDetails, attachments: null },
      isLoading: false,
    });

    const { container } = render(<PostContentBase postId="post-6" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
