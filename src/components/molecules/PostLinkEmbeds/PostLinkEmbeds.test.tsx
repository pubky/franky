import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostLinkEmbeds } from './PostLinkEmbeds';

vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Iframe: ({
    'data-testid': dataTestId,
    width = '100%',
    height = '315',
    ...props
  }: React.IframeHTMLAttributes<HTMLIFrameElement> & { 'data-testid'?: string }) => (
    <iframe
      data-testid={dataTestId}
      loading="lazy"
      allowFullScreen
      className="rounded-md"
      width={width}
      height={height}
      {...props}
    />
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

    it('handles youtu.be URL with query parameters', () => {
      render(<PostLinkEmbeds content="https://youtu.be/dQw4w9WgXcQ?t=123" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=123');
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

    it('renders YouTube embed for music.youtube.com URL', () => {
      render(<PostLinkEmbeds content="Music video: https://music.youtube.com/watch?v=UTD5buLHoR4" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/UTD5buLHoR4');
    });

    it('handles YouTube URL with trailing punctuation', () => {
      render(<PostLinkEmbeds content="Check this out: https://www.youtube.com/watch?v=dQw4w9WgXcQ!" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });

    it('handles YouTube URL with timestamp in seconds format', () => {
      render(<PostLinkEmbeds content="Timestamped: https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=123s" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=123');
    });

    it('handles YouTube URL with timestamp in h/m/s format', () => {
      render(<PostLinkEmbeds content="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1h2m3s" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=3723');
    });

    it('handles YouTube URL with timestamp as plain number', () => {
      render(<PostLinkEmbeds content="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=90');
    });

    it('handles YouTube URL with partial h/m/s format (minutes and seconds only)', () => {
      render(<PostLinkEmbeds content="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=2m30s" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=150');
    });

    it('does not render embed for YouTube video ID shorter than 11 characters', () => {
      render(<PostLinkEmbeds content="Invalid length: https://www.youtube.com/watch?v=dQw4w9WgXc" />);

      expect(screen.queryByTestId('YouTube video player')).not.toBeInTheDocument();
    });

    it('does not render embed for YouTube video ID longer than 11 characters', () => {
      render(<PostLinkEmbeds content="Invalid length: https://www.youtube.com/watch?v=dQw4w9WgXcQQ" />);

      expect(screen.queryByTestId('YouTube video player')).not.toBeInTheDocument();
    });

    it('does not render embed for YouTube video ID with invalid characters', () => {
      render(<PostLinkEmbeds content="Invalid chars: https://www.youtube.com/watch?v=dQw4w9WgX@!" />);

      expect(screen.queryByTestId('YouTube video player')).not.toBeInTheDocument();
    });

    it('renders embed for valid 11-character YouTube ID with valid characters', () => {
      render(<PostLinkEmbeds content="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />);

      const iframe = screen.getByTestId('YouTube video player');
      expect(iframe).toBeInTheDocument();
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
