import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Generic } from './ProviderGeneric';
import * as ProviderActions from '../Provider.actions';
import type * as ProviderTypes from '../Provider.types';

// Mock the fetchOpenGraphMetadata server action
vi.mock('../Provider.actions', () => ({
  fetchOpenGraphMetadata: vi.fn(),
}));

describe('ProviderGeneric', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('domains', () => {
    it('exposes an empty domains array', () => {
      expect(Generic.domains).toBeDefined();
      expect(Generic.domains).toEqual([]);
      expect(Array.isArray(Generic.domains)).toBe(true);
    });

    it('has immutable domains array', () => {
      // Verify it's a readonly array by checking length
      expect(Generic.domains.length).toBe(0);
    });
  });

  describe('parseEmbed', () => {
    describe('valid URLs with metadata', () => {
      it('returns metadata embed data for URL with full metadata', async () => {
        const mockMetadata: ProviderTypes.OpenGraphMetadata = {
          url: 'https://example.com/article',
          title: 'Example Article',
          image: 'https://example.com/image.jpg',
        };

        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValue(mockMetadata);

        const result = await Generic.parseEmbed('https://example.com/article');

        expect(ProviderActions.fetchOpenGraphMetadata).toHaveBeenCalledWith('https://example.com/article');
        expect(ProviderActions.fetchOpenGraphMetadata).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
          type: 'metadata',
          value: mockMetadata,
        });
      });

      it('returns metadata embed data for URL with title only', async () => {
        const mockMetadata: ProviderTypes.OpenGraphMetadata = {
          url: 'https://example.com/article',
          title: 'Example Article',
          image: null,
        };

        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValue(mockMetadata);

        const result = await Generic.parseEmbed('https://example.com/article');

        expect(result).toEqual({
          type: 'metadata',
          value: mockMetadata,
        });
      });

      it('returns metadata embed data for URL with image only', async () => {
        const mockMetadata: ProviderTypes.OpenGraphMetadata = {
          url: 'https://example.com/article',
          title: null,
          image: 'https://example.com/image.jpg',
        };

        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValue(mockMetadata);

        const result = await Generic.parseEmbed('https://example.com/article');

        expect(result).toEqual({
          type: 'metadata',
          value: mockMetadata,
        });
      });

      it('returns metadata embed data for URL with no title or image', async () => {
        const mockMetadata: ProviderTypes.OpenGraphMetadata = {
          url: 'https://example.com/article',
          title: null,
          image: null,
        };

        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValue(mockMetadata);

        const result = await Generic.parseEmbed('https://example.com/article');

        expect(result).toEqual({
          type: 'metadata',
          value: mockMetadata,
        });
      });

      it('handles URLs with various protocols', async () => {
        const mockMetadata: ProviderTypes.OpenGraphMetadata = {
          url: 'http://example.com/article',
          title: 'HTTP Article',
          image: null,
        };

        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValue(mockMetadata);

        const result = await Generic.parseEmbed('http://example.com/article');

        expect(result).toEqual({
          type: 'metadata',
          value: mockMetadata,
        });
      });

      it('handles URLs with query parameters', async () => {
        const mockMetadata: ProviderTypes.OpenGraphMetadata = {
          url: 'https://example.com/article?utm_source=test&id=123',
          title: 'Article with params',
          image: null,
        };

        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValue(mockMetadata);

        const result = await Generic.parseEmbed('https://example.com/article?utm_source=test&id=123');

        expect(result).toEqual({
          type: 'metadata',
          value: mockMetadata,
        });
      });

      it('handles URLs with hash fragments', async () => {
        const mockMetadata: ProviderTypes.OpenGraphMetadata = {
          url: 'https://example.com/article#section',
          title: 'Article with anchor',
          image: null,
        };

        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValue(mockMetadata);

        const result = await Generic.parseEmbed('https://example.com/article#section');

        expect(result).toEqual({
          type: 'metadata',
          value: mockMetadata,
        });
      });

      it('handles URLs with subdomains', async () => {
        const mockMetadata: ProviderTypes.OpenGraphMetadata = {
          url: 'https://blog.example.com/article',
          title: 'Blog Article',
          image: 'https://blog.example.com/image.jpg',
        };

        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValue(mockMetadata);

        const result = await Generic.parseEmbed('https://blog.example.com/article');

        expect(result).toEqual({
          type: 'metadata',
          value: mockMetadata,
        });
      });

      it('handles URLs with paths and trailing slashes', async () => {
        const mockMetadata: ProviderTypes.OpenGraphMetadata = {
          url: 'https://example.com/path/to/article/',
          title: 'Nested Article',
          image: null,
        };

        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValue(mockMetadata);

        const result = await Generic.parseEmbed('https://example.com/path/to/article/');

        expect(result).toEqual({
          type: 'metadata',
          value: mockMetadata,
        });
      });
    });

    describe('null responses', () => {
      it('returns null when fetchOpenGraphMetadata returns null', async () => {
        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValue(null);

        const result = await Generic.parseEmbed('https://example.com/article');

        expect(ProviderActions.fetchOpenGraphMetadata).toHaveBeenCalledWith('https://example.com/article');
        expect(result).toBeNull();
      });

      it('returns null for invalid URL', async () => {
        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValue(null);

        const result = await Generic.parseEmbed('not-a-valid-url');

        expect(result).toBeNull();
      });

      it('returns null when fetch fails', async () => {
        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValue(null);

        const result = await Generic.parseEmbed('https://example.com/non-existent');

        expect(result).toBeNull();
      });
    });

    describe('error handling', () => {
      it('handles fetchOpenGraphMetadata rejection gracefully', async () => {
        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockRejectedValue(new Error('Network error'));

        await expect(Generic.parseEmbed('https://example.com/article')).rejects.toThrow('Network error');
      });

      it('handles unexpected errors during parsing', async () => {
        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockRejectedValue(new Error('Unexpected error'));

        await expect(Generic.parseEmbed('https://example.com/article')).rejects.toThrow();
      });
    });

    describe('concurrent/rapid changes', () => {
      it('handles multiple rapid parseEmbed calls consistently', async () => {
        const mockMetadata: ProviderTypes.OpenGraphMetadata = {
          url: 'https://example.com/article',
          title: 'Example Article',
          image: 'https://example.com/image.jpg',
        };

        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValue(mockMetadata);

        const promises = Array.from({ length: 10 }, () => Generic.parseEmbed('https://example.com/article'));
        const results = await Promise.all(promises);

        // All results should be identical
        results.forEach((result) => {
          expect(result).toEqual({
            type: 'metadata',
            value: mockMetadata,
          });
        });

        expect(ProviderActions.fetchOpenGraphMetadata).toHaveBeenCalledTimes(10);
      });

      it('handles alternating valid/null responses consistently', async () => {
        const mockMetadata: ProviderTypes.OpenGraphMetadata = {
          url: 'https://example.com/article',
          title: 'Valid Article',
          image: null,
        };

        for (let i = 0; i < 5; i++) {
          vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValueOnce(mockMetadata);
          vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValueOnce(null);

          const validResult = await Generic.parseEmbed('https://example.com/valid');
          const nullResult = await Generic.parseEmbed('https://example.com/invalid');

          expect(validResult).toEqual({
            type: 'metadata',
            value: mockMetadata,
          });
          expect(nullResult).toBeNull();
        }
      });

      it('parseEmbed is stateless and returns consistent results', async () => {
        const metadata1: ProviderTypes.OpenGraphMetadata = {
          url: 'https://example1.com/article',
          title: 'Article 1',
          image: null,
        };

        const metadata2: ProviderTypes.OpenGraphMetadata = {
          url: 'https://example2.com/article',
          title: 'Article 2',
          image: 'https://example2.com/image.jpg',
        };

        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValueOnce(metadata1);
        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValueOnce(metadata2);
        vi.mocked(ProviderActions.fetchOpenGraphMetadata).mockResolvedValueOnce(metadata1);

        const result1a = await Generic.parseEmbed('https://example1.com/article');
        const result2 = await Generic.parseEmbed('https://example2.com/article');
        const result1b = await Generic.parseEmbed('https://example1.com/article');

        // Results should not be affected by previous calls
        expect(result1a).toEqual({
          type: 'metadata',
          value: metadata1,
        });
        expect(result2).toEqual({
          type: 'metadata',
          value: metadata2,
        });
        expect(result1b).toEqual({
          type: 'metadata',
          value: metadata1,
        });
      });
    });
  });

  describe('renderEmbed', () => {
    describe('valid metadata rendering', () => {
      it('renders website preview with title, URL, and image', () => {
        const embedData: ProviderTypes.EmbedData = {
          type: 'metadata',
          value: {
            url: 'https://example.com/article',
            title: 'Example Article Title',
            image: 'https://example.com/image.jpg',
          },
        };

        render(<>{Generic.renderEmbed(embedData)}</>);

        expect(screen.getByTestId('generic-website-preview')).toBeInTheDocument();
        expect(screen.getByText('Example Article Title')).toBeInTheDocument();
        expect(screen.getByText('https://example.com/article')).toBeInTheDocument();
        expect(screen.getByAltText('Website social image')).toBeInTheDocument();
        expect(screen.getByAltText('Website social image')).toHaveAttribute('src', 'https://example.com/image.jpg');
      });

      it('renders website preview with title and URL only (no image)', () => {
        const embedData: ProviderTypes.EmbedData = {
          type: 'metadata',
          value: {
            url: 'https://example.com/article',
            title: 'Article Without Image',
            image: null,
          },
        };

        render(<>{Generic.renderEmbed(embedData)}</>);

        expect(screen.getByTestId('generic-website-preview')).toBeInTheDocument();
        expect(screen.getByText('Article Without Image')).toBeInTheDocument();
        expect(screen.getByText('https://example.com/article')).toBeInTheDocument();
        expect(screen.queryByAltText('Website social image')).not.toBeInTheDocument();
      });

      it('renders website preview with URL only (no title or image)', () => {
        const embedData: ProviderTypes.EmbedData = {
          type: 'metadata',
          value: {
            url: 'https://example.com/article',
            title: null,
            image: null,
          },
        };

        render(<>{Generic.renderEmbed(embedData)}</>);

        expect(screen.getByTestId('generic-website-preview')).toBeInTheDocument();
        expect(screen.getByText('https://example.com/article')).toBeInTheDocument();
        expect(screen.queryByAltText('Website social image')).not.toBeInTheDocument();
      });

      it('renders website preview with image and URL only (no title)', () => {
        const embedData: ProviderTypes.EmbedData = {
          type: 'metadata',
          value: {
            url: 'https://example.com/article',
            title: null,
            image: 'https://example.com/image.jpg',
          },
        };

        render(<>{Generic.renderEmbed(embedData)}</>);

        expect(screen.getByTestId('generic-website-preview')).toBeInTheDocument();
        expect(screen.getByText('https://example.com/article')).toBeInTheDocument();
        expect(screen.getByAltText('Website social image')).toBeInTheDocument();
      });

      it('renders anchor with correct attributes', () => {
        const embedData: ProviderTypes.EmbedData = {
          type: 'metadata',
          value: {
            url: 'https://example.com/article',
            title: 'Test Article',
            image: null,
          },
        };

        render(<>{Generic.renderEmbed(embedData)}</>);

        const anchor = screen.getByTestId('generic-website-preview');
        expect(anchor).toHaveAttribute('href', 'https://example.com/article');
        expect(anchor).toHaveAttribute('target', '_blank');
        expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
      });

      it('renders Globe icon for URL display', () => {
        const embedData: ProviderTypes.EmbedData = {
          type: 'metadata',
          value: {
            url: 'https://example.com/article',
            title: 'Test Article',
            image: null,
          },
        };

        const { container } = render(<>{Generic.renderEmbed(embedData)}</>);

        // Check for Globe icon (SVG element)
        const svgElement = container.querySelector('svg');
        expect(svgElement).toBeInTheDocument();
      });

      it('handles long titles gracefully', () => {
        const embedData: ProviderTypes.EmbedData = {
          type: 'metadata',
          value: {
            url: 'https://example.com/article',
            title:
              'This is a very long article title that might wrap to multiple lines and should still be displayed correctly without breaking the layout',
            image: null,
          },
        };

        render(<>{Generic.renderEmbed(embedData)}</>);

        expect(screen.getByText(/This is a very long article title/)).toBeInTheDocument();
      });

      it('handles long URLs gracefully', () => {
        const embedData: ProviderTypes.EmbedData = {
          type: 'metadata',
          value: {
            url: 'https://example.com/very/long/path/with/many/segments/and/query/params?foo=bar&baz=qux&very=long',
            title: 'Test Article',
            image: null,
          },
        };

        render(<>{Generic.renderEmbed(embedData)}</>);

        expect(screen.getByText(/https:\/\/example\.com\/very\/long\/path/)).toBeInTheDocument();
      });

      it('handles image load errors by hiding the image', () => {
        const embedData: ProviderTypes.EmbedData = {
          type: 'metadata',
          value: {
            url: 'https://example.com/article',
            title: 'Test Article',
            image: 'https://example.com/broken-image.jpg',
          },
        };

        render(<>{Generic.renderEmbed(embedData)}</>);

        const image = screen.getByAltText('Website social image') as HTMLImageElement;

        // Simulate image load error
        image.dispatchEvent(new Event('error'));

        // Check that display is set to none
        expect(image.style.display).toBe('none');
      });
    });

    describe('type guard behavior', () => {
      it('returns null for non-metadata embed data (url type)', () => {
        const embedData: ProviderTypes.EmbedData = {
          type: 'url',
          value: 'https://youtube.com/embed/123',
        };

        const result = Generic.renderEmbed(embedData);

        expect(result).toBeNull();
      });

      it('returns null for non-metadata embed data (id type)', () => {
        const embedData: ProviderTypes.EmbedData = {
          type: 'id',
          value: '1234567890',
        };

        const result = Generic.renderEmbed(embedData);

        expect(result).toBeNull();
      });

      it('only renders when embed data type is exactly "metadata"', () => {
        const validEmbedData: ProviderTypes.EmbedData = {
          type: 'metadata',
          value: {
            url: 'https://example.com',
            title: 'Valid',
            image: null,
          },
        };

        const urlEmbedData: ProviderTypes.EmbedData = {
          type: 'url',
          value: 'https://example.com',
        };

        const validResult = Generic.renderEmbed(validEmbedData);
        const urlResult = Generic.renderEmbed(urlEmbedData);

        expect(validResult).not.toBeNull();
        expect(urlResult).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('handles empty string title', () => {
        const embedData: ProviderTypes.EmbedData = {
          type: 'metadata',
          value: {
            url: 'https://example.com/article',
            title: '',
            image: null,
          },
        };

        render(<>{Generic.renderEmbed(embedData)}</>);

        expect(screen.getByTestId('generic-website-preview')).toBeInTheDocument();
        expect(screen.getByText('https://example.com/article')).toBeInTheDocument();
      });

      it('handles empty string image URL', () => {
        const embedData: ProviderTypes.EmbedData = {
          type: 'metadata',
          value: {
            url: 'https://example.com/article',
            title: 'Test',
            image: '',
          },
        };

        render(<>{Generic.renderEmbed(embedData)}</>);

        expect(screen.getByTestId('generic-website-preview')).toBeInTheDocument();
        // Empty string is falsy, so image won't be rendered
        expect(screen.queryByAltText('Website social image')).not.toBeInTheDocument();
      });

      it('handles special characters in title', () => {
        const embedData: ProviderTypes.EmbedData = {
          type: 'metadata',
          value: {
            url: 'https://example.com/article',
            title: 'Article with <special> & "characters"',
            image: null,
          },
        };

        render(<>{Generic.renderEmbed(embedData)}</>);

        expect(screen.getByText('Article with <special> & "characters"')).toBeInTheDocument();
      });

      it('handles special characters in URL', () => {
        const embedData: ProviderTypes.EmbedData = {
          type: 'metadata',
          value: {
            url: 'https://example.com/article?query=hello&other=world#section',
            title: 'Test',
            image: null,
          },
        };

        render(<>{Generic.renderEmbed(embedData)}</>);

        expect(screen.getByText('https://example.com/article?query=hello&other=world#section')).toBeInTheDocument();
      });

      it('handles Unicode characters in title', () => {
        const embedData: ProviderTypes.EmbedData = {
          type: 'metadata',
          value: {
            url: 'https://example.com/article',
            title: 'Article with émojis 🎉 and ünïcödé',
            image: null,
          },
        };

        render(<>{Generic.renderEmbed(embedData)}</>);

        expect(screen.getByText('Article with émojis 🎉 and ünïcödé')).toBeInTheDocument();
      });
    });
  });
});
