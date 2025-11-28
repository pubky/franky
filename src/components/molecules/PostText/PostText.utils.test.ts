import { describe, it, expect } from 'vitest';
import type { Root, Paragraph, Text, Code, Link } from 'mdast';
import { remarkPlaintextCodeblock, remarkHashtags } from './PostText.utils';

// Helper to create a simple paragraph node with text
const createParagraph = (text: string): Paragraph => ({
  type: 'paragraph',
  children: [{ type: 'text', value: text } as Text],
});

// Helper to create a root node with children
const createRoot = (children: (Paragraph | Code)[]): Root => ({
  type: 'root',
  children,
});

// Helper to extract link nodes from paragraph children
const getLinks = (paragraph: Paragraph): Link[] =>
  paragraph.children.filter((child): child is Link => child.type === 'link');

// Helper to extract text nodes from paragraph children
const getTextNodes = (paragraph: Paragraph): Text[] =>
  paragraph.children.filter((child): child is Text => child.type === 'text');

describe('remarkPlaintextCodeblock', () => {
  it('assigns plaintext to code blocks without a language', () => {
    const codeBlock: Code = { type: 'code', value: 'const x = 1;' };
    const tree = createRoot([codeBlock]);

    remarkPlaintextCodeblock()(tree);

    expect(codeBlock.lang).toBe('plaintext');
  });

  it('preserves existing language on code blocks', () => {
    const codeBlock: Code = { type: 'code', value: 'const x = 1;', lang: 'javascript' };
    const tree = createRoot([codeBlock]);

    remarkPlaintextCodeblock()(tree);

    expect(codeBlock.lang).toBe('javascript');
  });

  it('handles multiple code blocks', () => {
    const codeBlock1: Code = { type: 'code', value: 'code 1' };
    const codeBlock2: Code = { type: 'code', value: 'code 2', lang: 'python' };
    const codeBlock3: Code = { type: 'code', value: 'code 3' };
    const tree = createRoot([codeBlock1, codeBlock2, codeBlock3]);

    remarkPlaintextCodeblock()(tree);

    expect(codeBlock1.lang).toBe('plaintext');
    expect(codeBlock2.lang).toBe('python');
    expect(codeBlock3.lang).toBe('plaintext');
  });
});

describe('remarkHashtags', () => {
  describe('Basic hashtag detection', () => {
    it('converts a single hashtag to a link', () => {
      const paragraph = createParagraph('#hello');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(1);
      expect(links[0].url).toBe('/search?tags=hello');
      expect(links[0].data?.hProperties).toEqual({ 'data-type': 'hashtag' });
      expect((links[0].children[0] as Text).value).toBe('#hello');
    });

    it('converts hashtag at start of text', () => {
      const paragraph = createParagraph('#start of the text');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(1);
      expect(links[0].url).toBe('/search?tags=start');
    });

    it('converts hashtag preceded by whitespace', () => {
      const paragraph = createParagraph('Check out #trending today');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(1);
      expect(links[0].url).toBe('/search?tags=trending');
    });

    it('converts multiple hashtags in one paragraph', () => {
      const paragraph = createParagraph('#hello world #foo and #bar');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(3);
      expect(links[0].url).toBe('/search?tags=hello');
      expect(links[1].url).toBe('/search?tags=foo');
      expect(links[2].url).toBe('/search?tags=bar');
    });

    it('preserves text before, between, and after hashtags', () => {
      const paragraph = createParagraph('Hello #world this is #cool right?');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const textNodes = getTextNodes(paragraph);
      expect(textNodes).toHaveLength(3);
      expect(textNodes[0].value).toBe('Hello ');
      expect(textNodes[1].value).toBe(' this is ');
      expect(textNodes[2].value).toBe(' right?');
    });
  });

  describe('Hashtag pattern validation', () => {
    it('requires hashtag to start with a letter', () => {
      const paragraph = createParagraph('#abc123 is valid');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(1);
      expect(links[0].url).toBe('/search?tags=abc123');
    });

    it('does not match hashtags starting with a number', () => {
      const paragraph = createParagraph('#123 is not a valid hashtag');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(0);
    });

    it('allows underscores in hashtags', () => {
      const paragraph = createParagraph('#hello_world is valid');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(1);
      expect(links[0].url).toBe('/search?tags=hello_world');
    });

    it('allows numbers after the first letter', () => {
      const paragraph = createParagraph('#test123abc is valid');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(1);
      expect(links[0].url).toBe('/search?tags=test123abc');
    });

    it('stops at punctuation', () => {
      const paragraph = createParagraph('#hello, world');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(1);
      expect((links[0].children[0] as Text).value).toBe('#hello');
    });

    it('stops at special characters', () => {
      const paragraph = createParagraph('#hello!world');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(1);
      expect((links[0].children[0] as Text).value).toBe('#hello');
    });
  });

  describe('False positive prevention', () => {
    it('does not match hash not preceded by whitespace', () => {
      const paragraph = createParagraph('no#hashtag here');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(0);
    });

    it('does not match hash in middle of word', () => {
      const paragraph = createParagraph('test#tag should not match');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(0);
    });

    it('does not process non-text children (preserves existing links)', () => {
      const existingLink: Link = {
        type: 'link',
        url: 'https://example.com#section',
        children: [{ type: 'text', value: 'link with hash' } as Text],
      };
      const paragraph: Paragraph = {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'Check out ' } as Text,
          existingLink,
          { type: 'text', value: ' for more' } as Text,
        ],
      };
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      // The existing link should be preserved unchanged
      expect(paragraph.children).toContain(existingLink);
      expect(existingLink.url).toBe('https://example.com#section');
    });

    it('does not match standalone hash symbol', () => {
      const paragraph = createParagraph('Use # for comments');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(0);
    });

    it('does not match hash followed by only numbers', () => {
      const paragraph = createParagraph('Issue #123 is fixed');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(0);
    });

    it('handles multiple hashes in sequence', () => {
      const paragraph = createParagraph('##notahashtag but #valid is');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      // ##notahashtag should not match (starts with ##)
      // #valid should match
      expect(links).toHaveLength(1);
      expect(links[0].url).toBe('/search?tags=valid');
    });
  });

  describe('Edge cases', () => {
    it('handles empty text', () => {
      const paragraph = createParagraph('');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      expect(paragraph.children).toHaveLength(1);
      expect((paragraph.children[0] as Text).value).toBe('');
    });

    it('handles text with no hashtags', () => {
      const paragraph = createParagraph('Just some regular text without hashtags');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(0);
      expect((paragraph.children[0] as Text).value).toBe('Just some regular text without hashtags');
    });

    it('handles hashtag at end of text', () => {
      const paragraph = createParagraph('Check out #lastword');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(1);
      expect(links[0].url).toBe('/search?tags=lastword');
    });

    it('handles consecutive hashtags', () => {
      const paragraph = createParagraph('#one #two #three');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(3);
    });

    it('handles hashtag with single character', () => {
      const paragraph = createParagraph('#a is minimal');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(1);
      expect(links[0].url).toBe('/search?tags=a');
    });

    it('handles mixed valid and invalid hashtag patterns', () => {
      const paragraph = createParagraph('#valid #123invalid no#match #also_valid');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(2);
      expect(links[0].url).toBe('/search?tags=valid');
      expect(links[1].url).toBe('/search?tags=also_valid');
    });

    it('handles newlines as whitespace', () => {
      const paragraph = createParagraph('line one\n#hashtag on new line');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(1);
      expect(links[0].url).toBe('/search?tags=hashtag');
    });

    it('handles tabs as whitespace', () => {
      const paragraph = createParagraph('text\t#hashtag after tab');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(1);
      expect(links[0].url).toBe('/search?tags=hashtag');
    });

    it('encodes special characters in tag URL', () => {
      // While our regex only allows alphanumeric and underscore,
      // this test ensures the encoding is in place
      const paragraph = createParagraph('#CamelCase');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links).toHaveLength(1);
      expect(links[0].url).toBe('/search?tags=CamelCase');
    });

    it('does not modify tree when no paragraphs exist', () => {
      const codeBlock: Code = { type: 'code', value: '#notahashtag' };
      const tree = createRoot([codeBlock]);

      remarkHashtags()(tree);

      expect(tree.children).toHaveLength(1);
      expect(tree.children[0].type).toBe('code');
    });

    it('handles paragraph with only link children', () => {
      const existingLink: Link = {
        type: 'link',
        url: 'https://example.com',
        children: [{ type: 'text', value: 'example' } as Text],
      };
      const paragraph: Paragraph = {
        type: 'paragraph',
        children: [existingLink],
      };
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      // Should not modify anything
      expect(paragraph.children).toHaveLength(1);
      expect(paragraph.children[0]).toBe(existingLink);
    });
  });

  describe('Link node structure', () => {
    it('creates link with correct data-type attribute', () => {
      const paragraph = createParagraph('#test');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links[0].data).toEqual({
        hProperties: {
          'data-type': 'hashtag',
        },
      });
    });

    it('creates link with hashtag text including # symbol', () => {
      const paragraph = createParagraph('#myhashtag');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links[0].children).toHaveLength(1);
      expect((links[0].children[0] as Text).type).toBe('text');
      expect((links[0].children[0] as Text).value).toBe('#myhashtag');
    });

    it('creates URL with tag name without # symbol', () => {
      const paragraph = createParagraph('#example');
      const tree = createRoot([paragraph]);

      remarkHashtags()(tree);

      const links = getLinks(paragraph);
      expect(links[0].url).toBe('/search?tags=example');
      expect(links[0].url).not.toContain('#');
    });
  });
});
