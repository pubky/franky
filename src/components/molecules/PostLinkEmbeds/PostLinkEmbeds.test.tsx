import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostLinkEmbeds } from './PostLinkEmbeds';
import * as PostLinkEmbedsUtils from './utils';

vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

describe('PostLinkEmbeds', () => {
  describe('YouTube URL parsing', () => {
    it('renders YouTube embed for standard youtube.com URL', () => {
      render(<PostLinkEmbeds content="Check out this video: https://www.youtube.com/watch?v=dQw4w9WgXcQ" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });

    it('renders YouTube embed for youtu.be URL', () => {
      render(<PostLinkEmbeds content="Watch this: https://youtu.be/dQw4w9WgXcQ" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });

    it('renders YouTube embed for mobile youtube.com URL', () => {
      render(<PostLinkEmbeds content="Mobile link: https://m.youtube.com/watch?v=dQw4w9WgXcQ" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });

    it('renders YouTube embed for youtube-nocookie.com URL', () => {
      render(<PostLinkEmbeds content="Privacy link: https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });

    it('renders YouTube embed for embed URL format', () => {
      render(<PostLinkEmbeds content="Embed: https://www.youtube.com/embed/dQw4w9WgXcQ" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });

    it('renders YouTube embed for shorts URL format', () => {
      render(<PostLinkEmbeds content="Check out this short: https://www.youtube.com/shorts/dQw4w9WgXcQ" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });

    it('renders YouTube embed for live stream URL format', () => {
      render(<PostLinkEmbeds content="Live stream: https://www.youtube.com/live/dQw4w9WgXcQ" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });

    it('renders YouTube embed for legacy /v URL format', () => {
      render(<PostLinkEmbeds content="Legacy format: https://www.youtube.com/v/dQw4w9WgXcQ" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });

    it('handles YouTube URL with trailing punctuation', () => {
      render(<PostLinkEmbeds content="Check this out: https://www.youtube.com/watch?v=dQw4w9WgXcQ!" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });

    it('handles YouTube URL with additional parameters', () => {
      render(<PostLinkEmbeds content="Timestamped: https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=123s" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });

    it('does not render embed for YouTube video ID with invalid character length', () => {
      render(<PostLinkEmbeds content="Invalid length: https://www.youtube.com/watch?v=dQw4w9WgXc" />);

      expect(screen.queryByTestId('YouTube video player')).not.toBeInTheDocument();
    });

    it('does not render embed for YouTube video ID with invalid characters', () => {
      render(<PostLinkEmbeds content="Invalid chars: https://www.youtube.com/watch?v=dQw4w9WgXc@" />);

      expect(screen.queryByTestId('YouTube video player')).not.toBeInTheDocument();
    });

    it('does not render embed for YouTube URL without video ID', () => {
      render(<PostLinkEmbeds content="No ID: https://www.youtube.com/channel/UC123" />);

      expect(screen.queryByTestId('YouTube video player')).not.toBeInTheDocument();
    });
  });

  describe('YouTube iframe attributes', () => {
    it('sets correct iframe attributes for YouTube embed', () => {
      render(<PostLinkEmbeds content="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toHaveAttribute('width', '100%');
      expect(iframe).toHaveAttribute('height', '315');
      expect(iframe).toHaveAttribute('allowFullScreen');
      expect(iframe).toHaveAttribute(
        'allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      );
      expect(iframe).toHaveClass('rounded-md');
    });
  });

  describe('Edge cases', () => {
    it('does not render embed for content without URLs', () => {
      render(<PostLinkEmbeds content="Just some regular text without any links" />);

      expect(screen.queryByTestId('container')).not.toBeInTheDocument();
    });

    it('does not render embed for empty content', () => {
      render(<PostLinkEmbeds content="" />);

      expect(screen.queryByTestId('container')).not.toBeInTheDocument();
    });

    it('handles malformed URLs gracefully', () => {
      render(<PostLinkEmbeds content="Bad URL: https://not-a-real-url-format" />);

      expect(screen.queryByTestId('container')).not.toBeInTheDocument();
    });

    it('handles content with multiple URLs, uses first one', () => {
      render(
        <PostLinkEmbeds content="First: https://www.youtube.com/watch?v=dQw4w9WgXcQ Second: https://www.example.com" />,
      );

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });

    it('handles URLs without protocol', () => {
      render(<PostLinkEmbeds content="No protocol: youtube.com/watch?v=dQw4w9WgXcQ" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });
  });
});

describe('PostLinkEmbeds - useMemo optimization', () => {
  it('memoizes parsing result when content does not change', () => {
    const parseSpy = vi.spyOn(PostLinkEmbedsUtils, 'parseContentForLinkEmbed');
    const { rerender } = render(<PostLinkEmbeds content="https://youtube.com/watch?v=dQw4w9WgXcQ" />);

    expect(parseSpy).toHaveBeenCalledTimes(1);

    // Re-render with same content should not call parse function again
    rerender(<PostLinkEmbeds content="https://youtube.com/watch?v=dQw4w9WgXcQ" />);
    expect(parseSpy).toHaveBeenCalledTimes(1);

    // Re-render with different content should call parse function again
    rerender(<PostLinkEmbeds content="https://youtube.com/watch?v=xyz123456" />);
    expect(parseSpy).toHaveBeenCalledTimes(2);

    parseSpy.mockRestore();
  });
});

describe('PostLinkEmbeds - Snapshots', () => {
  it('matches snapshot for YouTube embed', () => {
    const { container } = render(<PostLinkEmbeds content="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for no embed (no URL)', () => {
    const { container } = render(<PostLinkEmbeds content="Just some text without links" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
