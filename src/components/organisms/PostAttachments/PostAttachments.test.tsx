import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostAttachments } from './PostAttachments';
import * as Core from '@/core';

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/molecules', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock local sub-components
vi.mock('./PostAttachmentsImagesAndVideos', () => ({
  PostAttachmentsImagesAndVideos: vi.fn(({ imagesAndVideos }) => (
    <div data-testid="post-attachments-images-and-videos" data-count={imagesAndVideos.length}>
      ImagesAndVideos
    </div>
  )),
}));

vi.mock('./PostAttachmentsAudios', () => ({
  PostAttachmentsAudios: vi.fn(({ audios }) => (
    <div data-testid="post-attachments-audios" data-count={audios.length}>
      Audios
    </div>
  )),
}));

vi.mock('./PostAttachmentsGenericFiles', () => ({
  PostAttachmentsGenericFiles: vi.fn(({ genericFiles }) => (
    <div data-testid="post-attachments-generic-files" data-count={genericFiles.length}>
      GenericFiles
    </div>
  )),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

// Mock core
vi.mock('@/core', () => ({
  FileController: {
    getMetadata: vi.fn(),
    getFileUrl: vi.fn(),
  },
  FileVariant: {
    MAIN: 'main',
    FEED: 'feed',
    SMALL: 'small',
  },
}));

const mockGetMetadata = vi.mocked(Core.FileController.getMetadata);
const mockGetFileUrl = vi.mocked(Core.FileController.getFileUrl);

// Helper to create mock metadata
const createMockImageMetadata = (id: string, name = 'image.jpg') => ({
  id,
  name,
  content_type: 'image/jpeg',
  size: 1024,
});

const createMockVideoMetadata = (id: string, name = 'video.mp4') => ({
  id,
  name,
  content_type: 'video/mp4',
  size: 2048,
});

const createMockAudioMetadata = (id: string, name = 'audio.mp3') => ({
  id,
  name,
  content_type: 'audio/mpeg',
  size: 512,
});

const createMockPdfMetadata = (id: string, name = 'document.pdf') => ({
  id,
  name,
  content_type: 'application/pdf',
  size: 4096,
});

const createMockGifMetadata = (id: string, name = 'animation.gif') => ({
  id,
  name,
  content_type: 'image/gif',
  size: 768,
});

describe('PostAttachments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFileUrl.mockImplementation(({ fileId, variant }) => `https://cdn.example.com/${fileId}/${variant}`);
  });

  describe('Rendering', () => {
    it('renders nothing when attachments is null', () => {
      const { container } = render(<PostAttachments attachments={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when attachments is undefined', () => {
      const { container } = render(<PostAttachments attachments={undefined} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when attachments is empty array', () => {
      const { container } = render(<PostAttachments attachments={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders container when attachments are loaded', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/file1'];
      mockGetMetadata.mockResolvedValue([createMockImageMetadata('user1:file1')]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(screen.getByTestId('container')).toBeInTheDocument();
      });
    });

    it('applies correct className to container', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/file1'];
      mockGetMetadata.mockResolvedValue([createMockImageMetadata('user1:file1')]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(screen.getByTestId('container')).toHaveClass('gap-3');
      });
    });
  });

  describe('Media type categorization', () => {
    it('renders images in PostAttachmentsImagesAndVideos', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/image1'];
      mockGetMetadata.mockResolvedValue([createMockImageMetadata('user1:image1')]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(screen.getByTestId('post-attachments-images-and-videos')).toBeInTheDocument();
        expect(screen.getByTestId('post-attachments-images-and-videos')).toHaveAttribute('data-count', '1');
      });
    });

    it('renders videos in PostAttachmentsImagesAndVideos', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/video1'];
      mockGetMetadata.mockResolvedValue([createMockVideoMetadata('user1:video1')]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(screen.getByTestId('post-attachments-images-and-videos')).toBeInTheDocument();
        expect(screen.getByTestId('post-attachments-images-and-videos')).toHaveAttribute('data-count', '1');
      });
    });

    it('renders audios in PostAttachmentsAudios', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/audio1'];
      mockGetMetadata.mockResolvedValue([createMockAudioMetadata('user1:audio1')]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(screen.getByTestId('post-attachments-audios')).toBeInTheDocument();
        expect(screen.getByTestId('post-attachments-audios')).toHaveAttribute('data-count', '1');
      });
    });

    it('renders generic files in PostAttachmentsGenericFiles', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/doc1'];
      mockGetMetadata.mockResolvedValue([createMockPdfMetadata('user1:doc1')]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(screen.getByTestId('post-attachments-generic-files')).toBeInTheDocument();
        expect(screen.getByTestId('post-attachments-generic-files')).toHaveAttribute('data-count', '1');
      });
    });

    it('categorizes mixed attachment types correctly', async () => {
      const attachments = [
        'pubky://user1/pub/pubky.app/files/image1',
        'pubky://user1/pub/pubky.app/files/video1',
        'pubky://user1/pub/pubky.app/files/audio1',
        'pubky://user1/pub/pubky.app/files/doc1',
      ];
      mockGetMetadata.mockResolvedValue([
        createMockImageMetadata('user1:image1'),
        createMockVideoMetadata('user1:video1'),
        createMockAudioMetadata('user1:audio1'),
        createMockPdfMetadata('user1:doc1'),
      ]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(screen.getByTestId('post-attachments-images-and-videos')).toHaveAttribute('data-count', '2');
        expect(screen.getByTestId('post-attachments-audios')).toHaveAttribute('data-count', '1');
        expect(screen.getByTestId('post-attachments-generic-files')).toHaveAttribute('data-count', '1');
      });
    });

    it('handles multiple images correctly', async () => {
      const attachments = [
        'pubky://user1/pub/pubky.app/files/image1',
        'pubky://user1/pub/pubky.app/files/image2',
        'pubky://user1/pub/pubky.app/files/image3',
      ];
      mockGetMetadata.mockResolvedValue([
        createMockImageMetadata('user1:image1'),
        createMockImageMetadata('user1:image2'),
        createMockImageMetadata('user1:image3'),
      ]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(screen.getByTestId('post-attachments-images-and-videos')).toHaveAttribute('data-count', '3');
      });
    });

    it('handles GIF images correctly (categorized with images)', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/gif1'];
      mockGetMetadata.mockResolvedValue([createMockGifMetadata('user1:gif1')]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(screen.getByTestId('post-attachments-images-and-videos')).toBeInTheDocument();
        expect(screen.getByTestId('post-attachments-images-and-videos')).toHaveAttribute('data-count', '1');
      });
    });
  });

  describe('URL generation', () => {
    it('generates main URL for images', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/image1'];
      mockGetMetadata.mockResolvedValue([createMockImageMetadata('user1:image1')]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(mockGetFileUrl).toHaveBeenCalledWith({ fileId: 'user1:image1', variant: Core.FileVariant.MAIN });
        expect(mockGetFileUrl).toHaveBeenCalledWith({ fileId: 'user1:image1', variant: Core.FileVariant.FEED });
      });
    });

    it('generates only main URL for videos (no feed variant)', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/video1'];
      mockGetMetadata.mockResolvedValue([createMockVideoMetadata('user1:video1')]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(mockGetFileUrl).toHaveBeenCalledWith({ fileId: 'user1:video1', variant: Core.FileVariant.MAIN });
      });

      // Videos should not have feed variant
      const feedCalls = mockGetFileUrl.mock.calls.filter(
        (call) => call[0].fileId === 'user1:video1' && call[0].variant === Core.FileVariant.FEED,
      );
      expect(feedCalls).toHaveLength(0);
    });

    it('generates only main URL for audio files', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/audio1'];
      mockGetMetadata.mockResolvedValue([createMockAudioMetadata('user1:audio1')]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(mockGetFileUrl).toHaveBeenCalledWith({ fileId: 'user1:audio1', variant: Core.FileVariant.MAIN });
      });
    });

    it('generates only main URL for generic files', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/doc1'];
      mockGetMetadata.mockResolvedValue([createMockPdfMetadata('user1:doc1')]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(mockGetFileUrl).toHaveBeenCalledWith({ fileId: 'user1:doc1', variant: Core.FileVariant.MAIN });
      });
    });
  });

  describe('FileController integration', () => {
    it('calls getMetadata with correct fileAttachments', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/file1', 'pubky://user2/pub/pubky.app/files/file2'];
      mockGetMetadata.mockResolvedValue([
        createMockImageMetadata('user1:file1'),
        createMockImageMetadata('user2:file2'),
      ]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(mockGetMetadata).toHaveBeenCalledWith({ fileAttachments: attachments });
      });
    });

    it('does not call getMetadata when attachments is empty', () => {
      render(<PostAttachments attachments={[]} />);

      expect(mockGetMetadata).not.toHaveBeenCalled();
    });

    it('does not call getMetadata when attachments is null', () => {
      render(<PostAttachments attachments={null} />);

      expect(mockGetMetadata).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('shows toast error when getMetadata fails', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/file1'];
      mockGetMetadata.mockRejectedValue(new Error('Network error'));

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to load post attachments',
        });
      });
    });

    it('renders nothing when error occurs', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/file1'];
      mockGetMetadata.mockRejectedValue(new Error('Network error'));

      const { container } = render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled();
      });

      // Should not render anything after error
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Conditional rendering of sub-components', () => {
    it('does not render PostAttachmentsImagesAndVideos when no images or videos', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/audio1'];
      mockGetMetadata.mockResolvedValue([createMockAudioMetadata('user1:audio1')]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(screen.getByTestId('post-attachments-audios')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('post-attachments-images-and-videos')).not.toBeInTheDocument();
    });

    it('does not render PostAttachmentsAudios when no audios', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/image1'];
      mockGetMetadata.mockResolvedValue([createMockImageMetadata('user1:image1')]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(screen.getByTestId('post-attachments-images-and-videos')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('post-attachments-audios')).not.toBeInTheDocument();
    });

    it('does not render PostAttachmentsGenericFiles when no generic files', async () => {
      const attachments = ['pubky://user1/pub/pubky.app/files/image1'];
      mockGetMetadata.mockResolvedValue([createMockImageMetadata('user1:image1')]);

      render(<PostAttachments attachments={attachments} />);

      await waitFor(() => {
        expect(screen.getByTestId('post-attachments-images-and-videos')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('post-attachments-generic-files')).not.toBeInTheDocument();
    });
  });

  describe('Re-fetching on attachments change', () => {
    it('re-fetches metadata when attachments prop changes', async () => {
      const initialAttachments = ['pubky://user1/pub/pubky.app/files/file1'];
      const newAttachments = ['pubky://user2/pub/pubky.app/files/file2'];

      mockGetMetadata.mockResolvedValue([createMockImageMetadata('user1:file1')]);

      const { rerender } = render(<PostAttachments attachments={initialAttachments} />);

      await waitFor(() => {
        expect(mockGetMetadata).toHaveBeenCalledWith({ fileAttachments: initialAttachments });
      });

      mockGetMetadata.mockResolvedValue([createMockImageMetadata('user2:file2')]);

      rerender(<PostAttachments attachments={newAttachments} />);

      await waitFor(() => {
        expect(mockGetMetadata).toHaveBeenCalledWith({ fileAttachments: newAttachments });
      });
    });
  });
});

describe('PostAttachments - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFileUrl.mockImplementation(({ fileId, variant }) => `https://cdn.example.com/${fileId}/${variant}`);
  });

  it('matches snapshot with images only', async () => {
    const attachments = ['pubky://user1/pub/pubky.app/files/image1', 'pubky://user1/pub/pubky.app/files/image2'];
    mockGetMetadata.mockResolvedValue([
      createMockImageMetadata('user1:image1'),
      createMockImageMetadata('user1:image2'),
    ]);

    const { container } = render(<PostAttachments attachments={attachments} />);

    await waitFor(() => {
      expect(screen.getByTestId('post-attachments-images-and-videos')).toBeInTheDocument();
    });

    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with videos only', async () => {
    const attachments = ['pubky://user1/pub/pubky.app/files/video1', 'pubky://user1/pub/pubky.app/files/video2'];
    mockGetMetadata.mockResolvedValue([
      createMockVideoMetadata('user1:video1'),
      createMockVideoMetadata('user1:video2'),
    ]);

    const { container } = render(<PostAttachments attachments={attachments} />);

    await waitFor(() => {
      expect(screen.getByTestId('post-attachments-images-and-videos')).toBeInTheDocument();
    });

    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with audios only', async () => {
    const attachments = ['pubky://user1/pub/pubky.app/files/audio1'];
    mockGetMetadata.mockResolvedValue([createMockAudioMetadata('user1:audio1')]);

    const { container } = render(<PostAttachments attachments={attachments} />);

    await waitFor(() => {
      expect(screen.getByTestId('post-attachments-audios')).toBeInTheDocument();
    });

    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with generic files only', async () => {
    const attachments = ['pubky://user1/pub/pubky.app/files/doc1'];
    mockGetMetadata.mockResolvedValue([createMockPdfMetadata('user1:doc1')]);

    const { container } = render(<PostAttachments attachments={attachments} />);

    await waitFor(() => {
      expect(screen.getByTestId('post-attachments-generic-files')).toBeInTheDocument();
    });

    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with mixed attachment types', async () => {
    const attachments = [
      'pubky://user1/pub/pubky.app/files/image1',
      'pubky://user1/pub/pubky.app/files/video1',
      'pubky://user1/pub/pubky.app/files/audio1',
      'pubky://user1/pub/pubky.app/files/doc1',
    ];
    mockGetMetadata.mockResolvedValue([
      createMockImageMetadata('user1:image1'),
      createMockVideoMetadata('user1:video1'),
      createMockAudioMetadata('user1:audio1'),
      createMockPdfMetadata('user1:doc1'),
    ]);

    const { container } = render(<PostAttachments attachments={attachments} />);

    await waitFor(() => {
      expect(screen.getByTestId('post-attachments-images-and-videos')).toBeInTheDocument();
      expect(screen.getByTestId('post-attachments-audios')).toBeInTheDocument();
      expect(screen.getByTestId('post-attachments-generic-files')).toBeInTheDocument();
    });

    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with null attachments', () => {
    const { container } = render(<PostAttachments attachments={null} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty attachments', () => {
    const { container } = render(<PostAttachments attachments={[]} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
