import { describe, it, expect } from 'vitest';
import { Metadata } from './Metadata';

describe('Metadata', () => {
  describe('basic functionality', () => {
    it('returns metadata object with required fields', () => {
      const result = Metadata({
        title: 'Test Title',
        description: 'Test Description',
      });

      expect(result).toEqual({
        title: 'Test Title',
        description: 'Test Description',
        keywords: 'pubky, social media, decentralized, key, pkarr, pubky core',
        authors: [{ name: 'Pubky Team' }],
        creator: 'Pubky Team',
        icons: {
          icon: '/pubky-favicon.svg',
          shortcut: '/pubky-favicon.svg',
          apple: '/pubky-favicon.svg',
        },
        openGraph: {
          title: 'Test Title',
          description: 'Test Description',
          url: 'https://pubky.app',
          siteName: 'Pubky App',
          images: [
            {
              url: '/preview.png',
              width: 1200,
              height: 630,
              alt: 'Test Title',
            },
          ],
          locale: 'en_US',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Test Title',
          description: 'Test Description',
          images: ['/preview.png'],
          creator: '@pubkyapp',
          site: '@pubkyapp',
        },
        robots: {
          index: true,
          follow: true,
        },
        alternates: {
          canonical: 'https://pubky.app',
        },
      });
    });

    it('uses default values when optional parameters are not provided', () => {
      const result = Metadata({
        title: 'Minimal Title',
        description: 'Minimal Description',
      });

      expect(result.keywords).toBe('pubky, social media, decentralized, key, pkarr, pubky core');
      expect(result.authors).toEqual([{ name: 'Pubky Team' }]);
      expect(result.creator).toBe('Pubky Team');
      expect(result.openGraph.siteName).toBe('Pubky App');
      expect(result.openGraph.locale).toBe('en_US');
      expect(result.openGraph.type).toBe('website');
      expect(result.robots).toEqual({ index: true, follow: true });
    });
  });

  describe('optional parameters', () => {
    it('overrides default values when provided', () => {
      const result = Metadata({
        title: 'Custom Title',
        description: 'Custom Description',
        image: '/custom-image.jpg',
        type: 'article',
        url: 'https://custom-url.com',
        siteName: 'Custom Site',
        locale: 'it_IT',
        author: 'Custom Author',
        keywords: 'custom, keywords',
        robots: false,
      });

      expect(result.keywords).toBe('custom, keywords');
      expect(result.authors).toEqual([{ name: 'Custom Author' }]);
      expect(result.creator).toBe('Custom Author');
      expect(result.openGraph.images[0].url).toBe('/custom-image.jpg');
      expect(result.openGraph.type).toBe('article');
      expect(result.openGraph.url).toBe('https://custom-url.com');
      expect(result.openGraph.siteName).toBe('Custom Site');
      expect(result.openGraph.locale).toBe('it_IT');
      expect(result.robots).toEqual({ index: false, follow: false });
      expect(result.alternates.canonical).toBe('https://custom-url.com');
    });

    it('handles custom image correctly', () => {
      const result = Metadata({
        title: 'Image Test',
        description: 'Testing custom image',
        image: '/my-image.png',
      });

      expect(result.openGraph.images[0].url).toBe('/my-image.png');
      expect(result.twitter.images[0]).toBe('/my-image.png');
    });

    it('handles custom URL correctly', () => {
      const result = Metadata({
        title: 'URL Test',
        description: 'Testing custom URL',
        url: 'https://example.com/page',
      });

      expect(result.openGraph.url).toBe('https://example.com/page');
      expect(result.alternates.canonical).toBe('https://example.com/page');
    });

    it('handles robots parameter correctly', () => {
      // Test with robots: false
      const resultFalse = Metadata({
        title: 'Robots False',
        description: 'Testing robots false',
        robots: false,
      });
      expect(resultFalse.robots).toEqual({ index: false, follow: false });

      // Test with robots: true
      const resultTrue = Metadata({
        title: 'Robots True',
        description: 'Testing robots true',
        robots: true,
      });
      expect(resultTrue.robots).toEqual({ index: true, follow: true });

      // Test without robots (should default to true)
      const resultDefault = Metadata({
        title: 'Robots Default',
        description: 'Testing robots default',
      });
      expect(resultDefault.robots).toEqual({ index: true, follow: true });
    });
  });

  describe('edge cases', () => {
    it('handles empty strings gracefully', () => {
      const result = Metadata({
        title: '',
        description: '',
      });

      expect(result.title).toBe('');
      expect(result.description).toBe('');
      expect(result.openGraph.title).toBe('');
      expect(result.openGraph.description).toBe('');
    });

    it('handles very long titles and descriptions', () => {
      const longTitle = 'A'.repeat(1000);
      const longDescription = 'B'.repeat(1000);

      const result = Metadata({
        title: longTitle,
        description: longDescription,
      });

      expect(result.title).toBe(longTitle);
      expect(result.description).toBe(longDescription);
      expect(result.openGraph.title).toBe(longTitle);
      expect(result.openGraph.description).toBe(longDescription);
    });

    it('handles special characters in title and description', () => {
      const result = Metadata({
        title: 'Special chars: <>&"\'',
        description: 'More special: ©®™€£¥',
      });

      expect(result.title).toBe('Special chars: <>&"\'');
      expect(result.description).toBe('More special: ©®™€£¥');
    });
  });

  describe('default constants', () => {
    it('uses correct default values', () => {
      const result = Metadata({
        title: 'Test',
        description: 'Test',
      });

      expect(result.openGraph.siteName).toBe('Pubky App');
      expect(result.openGraph.locale).toBe('en_US');
      expect(result.openGraph.type).toBe('website');
      expect(result.authors[0].name).toBe('Pubky Team');
      expect(result.creator).toBe('Pubky Team');
      expect(result.keywords).toBe('pubky, social media, decentralized, key, pkarr, pubky core');
      expect(result.openGraph.images[0].url).toBe('/preview.png');
      expect(result.twitter.creator).toBe('@pubkyapp');
      expect(result.twitter.site).toBe('@pubkyapp');
      expect(result.alternates.canonical).toBe('https://pubky.app');
    });

    it('configures favicon and icons correctly', () => {
      const result = Metadata({
        title: 'Test',
        description: 'Test',
      });

      // Verify favicon configuration
      expect(result.icons).toEqual({
        icon: '/pubky-favicon.svg',
        shortcut: '/pubky-favicon.svg',
        apple: '/pubky-favicon.svg',
      });

      // Verify individual icon properties
      expect(result.icons.icon).toBe('/pubky-favicon.svg');
      expect(result.icons.shortcut).toBe('/pubky-favicon.svg');
      expect(result.icons.apple).toBe('/pubky-favicon.svg');
    });
  });

  describe('icon configuration', () => {
    it('always includes the correct favicon path', () => {
      const testCases = [
        { title: 'Basic', description: 'Basic test' },
        { title: 'With custom image', description: 'Custom image test', image: '/custom.jpg' },
        { title: 'With custom URL', description: 'Custom URL test', url: 'https://example.com' },
        { title: 'With robots false', description: 'Robots test', robots: false },
      ];

      testCases.forEach((testCase) => {
        const result = Metadata(testCase);

        expect(result.icons).toBeDefined();
        expect(result.icons.icon).toBe('/pubky-favicon.svg');
        expect(result.icons.shortcut).toBe('/pubky-favicon.svg');
        expect(result.icons.apple).toBe('/pubky-favicon.svg');
      });
    });

    it('favicon path is consistent across all icon types', () => {
      const result = Metadata({
        title: 'Icon consistency test',
        description: 'Testing icon consistency',
      });

      const iconPath = '/pubky-favicon.svg';
      expect(result.icons.icon).toBe(iconPath);
      expect(result.icons.shortcut).toBe(iconPath);
      expect(result.icons.apple).toBe(iconPath);

      // Verify all icon paths are the same
      const allIconPaths = Object.values(result.icons);
      const uniquePaths = new Set(allIconPaths);
      expect(uniquePaths.size).toBe(1);
      expect(uniquePaths.has(iconPath)).toBe(true);
    });
  });
});
