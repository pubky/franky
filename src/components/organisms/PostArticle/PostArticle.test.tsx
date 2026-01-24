import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostArticle } from './PostArticle';
import * as Core from '@/core';

// Mock hooks
const mockUsePostArticle = vi.fn();

vi.mock('@/hooks', () => ({
  usePostArticle: (params: { content: string; attachments: string[]; coverImageVariant: Core.FileVariant }) =>
    mockUsePostArticle(params),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <span data-testid="typography" data-size={size} className={className}>
      {children}
    </span>
  ),
  Image: ({
    src,
    alt,
    className,
    width,
    height,
  }: {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
  }) => <img data-testid="cover-image" src={src} alt={alt} className={className} width={width} height={height} />,
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  PostText: ({ content, isArticle, className }: { content: string; isArticle?: boolean; className?: string }) => (
    <div data-testid="post-text" data-is-article={isArticle} className={className}>
      {content}
    </div>
  ),
}));

// Mock libs - use actual implementations
vi.mock('@/libs', async () => {
  const actual = await vi.importActual('@/libs');
  return { ...actual };
});

describe('PostArticle', () => {
  const defaultProps = {
    content: '{"title":"Test Article Title","body":"This is the article body content."}',
    attachments: ['pubky://user/pub/pubky.app/files/file-123'],
  };

  const mockHookReturnWithImage = {
    title: 'Test Article Title',
    body: 'This is the article body content.',
    coverImage: {
      src: 'https://example.com/cover-image.jpg',
      alt: 'Cover Image',
    },
  };

  const mockHookReturnWithoutImage = {
    title: 'Test Article Title',
    body: 'This is the article body content.',
    coverImage: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePostArticle.mockReturnValue(mockHookReturnWithImage);
  });

  describe('Rendering', () => {
    it('renders article with title and body', () => {
      render(<PostArticle {...defaultProps} />);

      expect(screen.getByTestId('typography')).toBeInTheDocument();
      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
      expect(screen.getByTestId('post-text')).toBeInTheDocument();
      expect(screen.getByText('This is the article body content.')).toBeInTheDocument();
    });

    it('renders cover image when available', () => {
      render(<PostArticle {...defaultProps} />);

      const image = screen.getByTestId('cover-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/cover-image.jpg');
      expect(image).toHaveAttribute('alt', 'Cover Image');
    });

    it('does not render cover image when not available', () => {
      mockUsePostArticle.mockReturnValue(mockHookReturnWithoutImage);

      render(<PostArticle {...defaultProps} />);

      expect(screen.queryByTestId('cover-image')).not.toBeInTheDocument();
    });

    it('applies custom className to container', () => {
      render(<PostArticle {...defaultProps} className="custom-class" />);

      const containers = screen.getAllByTestId('container');
      expect(containers[0]).toHaveClass('custom-class');
    });

    it('passes isArticle prop to PostText', () => {
      render(<PostArticle {...defaultProps} />);

      const postText = screen.getByTestId('post-text');
      expect(postText).toHaveAttribute('data-is-article', 'true');
    });

    it('applies muted-foreground class to PostText', () => {
      render(<PostArticle {...defaultProps} />);

      const postText = screen.getByTestId('post-text');
      expect(postText).toHaveClass('text-muted-foreground');
    });

    it('renders typography with large size', () => {
      render(<PostArticle {...defaultProps} />);

      const typography = screen.getByTestId('typography');
      expect(typography).toHaveAttribute('data-size', 'lg');
    });
  });

  describe('Hook Integration', () => {
    it('calls usePostArticle with correct parameters', () => {
      render(<PostArticle {...defaultProps} />);

      expect(mockUsePostArticle).toHaveBeenCalledWith({
        content: defaultProps.content,
        attachments: defaultProps.attachments,
        coverImageVariant: Core.FileVariant.FEED,
      });
    });

    it('calls usePostArticle with empty attachments', () => {
      render(<PostArticle content={defaultProps.content} attachments={[]} />);

      expect(mockUsePostArticle).toHaveBeenCalledWith({
        content: defaultProps.content,
        attachments: [],
        coverImageVariant: Core.FileVariant.FEED,
      });
    });

    it('calls usePostArticle with multiple attachments', () => {
      const multipleAttachments = [
        'pubky://user/pub/pubky.app/files/file-123',
        'pubky://user/pub/pubky.app/files/file-456',
      ];

      render(<PostArticle content={defaultProps.content} attachments={multipleAttachments} />);

      expect(mockUsePostArticle).toHaveBeenCalledWith({
        content: defaultProps.content,
        attachments: multipleAttachments,
        coverImageVariant: Core.FileVariant.FEED,
      });
    });
  });

  describe('Cover Image Styling', () => {
    it('renders cover image with correct dimensions', () => {
      render(<PostArticle {...defaultProps} />);

      const image = screen.getByTestId('cover-image');
      expect(image).toHaveAttribute('width', '180');
      expect(image).toHaveAttribute('height', '100');
    });

    it('renders cover image with correct styling classes', () => {
      render(<PostArticle {...defaultProps} />);

      const image = screen.getByTestId('cover-image');
      expect(image).toHaveClass('h-25');
      expect(image).toHaveClass('w-45');
      expect(image).toHaveClass('rounded-md');
      expect(image).toHaveClass('object-cover');
      expect(image).toHaveClass('object-center');
    });
  });

  describe('Snapshots', () => {
    it('matches snapshot with cover image', () => {
      const { container } = render(<PostArticle {...defaultProps} />);

      expect(container).toMatchSnapshot();
    });

    it('matches snapshot without cover image', () => {
      mockUsePostArticle.mockReturnValue(mockHookReturnWithoutImage);

      const { container } = render(<PostArticle {...defaultProps} />);

      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with custom className', () => {
      const { container } = render(<PostArticle {...defaultProps} className="custom-article-class" />);

      expect(container).toMatchSnapshot();
    });

    it('matches snapshot with long title and body', () => {
      mockUsePostArticle.mockReturnValue({
        title: 'This is a very long article title that might wrap to multiple lines in the UI',
        body: 'This is a much longer article body content that contains multiple sentences. It should properly handle long text content and display it correctly within the component boundaries.',
        coverImage: mockHookReturnWithImage.coverImage,
      });

      const { container } = render(<PostArticle {...defaultProps} />);

      expect(container).toMatchSnapshot();
    });
  });
});
