import type { Root, Paragraph, Text, Link, PhrasingContent } from 'mdast';
import { ReactNode } from 'react';
import { visit } from 'unist-util-visit';

// We assign full code blocks without a language specified as plaintext (ex. ```...```)
export const remarkPlaintextCodeblock = () => (tree: Root) => {
  visit(tree, 'code', (node) => {
    node.lang = node.lang ?? 'plaintext';
  });
};

// Configuration for pattern-matching remark plugins
interface PatternPluginConfig {
  // Regex to match - must have capture groups: (leadingWhitespace)(fullMatch)
  regex: RegExp;
  // Function to generate the URL from the matched text
  getUrl: (match: string) => string;
  // The data-type attribute value for the link
  dataType: string;
}

// Factory function that creates a remark plugin for pattern matching and link conversion
const createPatternPlugin = (config: PatternPluginConfig) => {
  const { regex, getUrl, dataType } = config;

  return () => (tree: Root) => {
    visit(tree, 'paragraph', (node: Paragraph) => {
      const newChildren: PhrasingContent[] = [];
      let hasChanges = false;

      for (const child of node.children) {
        // Only process direct text children to avoid false positives in URLs, code, etc.
        if (child.type !== 'text') {
          newChildren.push(child);
          continue;
        }

        const text = (child as Text).value;
        const segments: PhrasingContent[] = [];
        let lastIndex = 0;

        for (const match of text.matchAll(regex)) {
          hasChanges = true;
          const [fullMatch, leadingWhitespace, matchedText] = match;
          const matchStart = match.index;

          // Add text before the match (including any leading whitespace from the match)
          const textBefore = text.slice(lastIndex, matchStart) + leadingWhitespace;
          if (textBefore) {
            segments.push({
              type: 'text',
              value: textBefore,
            } as Text);
          }

          // Create a link node with the appropriate data-type for differentiation
          segments.push({
            type: 'link',
            url: getUrl(matchedText),
            data: {
              hProperties: {
                'data-type': dataType,
              },
            },
            children: [{ type: 'text', value: matchedText } as Text],
          } as Link);

          lastIndex = matchStart + fullMatch.length;
        }

        // Add any remaining text after the last match
        if (lastIndex < text.length) {
          segments.push({
            type: 'text',
            value: text.slice(lastIndex),
          } as Text);
        }

        // If we found matches, use the segments; otherwise keep original child
        if (segments.length > 0) {
          newChildren.push(...segments);
        } else {
          newChildren.push(child);
        }
      }

      // Only update children if we made changes
      if (hasChanges) {
        node.children = newChildren;
      }
    });
  };
};

// Parse hashtags in paragraph text nodes and convert them to links with data-type="hashtag"
// Hashtag pattern: # followed by a letter or number, then letters/numbers, with underscores or hyphens allowed only between alphanumerics
// Must be at start of text or preceded by whitespace (standalone)
export const remarkHashtags = createPatternPlugin({
  regex: /(^|\s)(#[a-zA-Z0-9]+(?:[-_][a-zA-Z0-9]+)*)/g,
  getUrl: (hashtag: string) => {
    // Extract tag name without the # symbol for the URL
    const tagName = hashtag.slice(1);
    return `/search?tags=${encodeURIComponent(tagName)}`;
  },
  dataType: 'hashtag',
});

// Parse mentions in paragraph text nodes and convert them to links with data-type="mention"
// Mention pattern: pk: or pubky followed by exactly 52 lowercase alphanumeric characters
// Must be at start of text or preceded by whitespace (standalone)
export const remarkMentions = createPatternPlugin({
  regex: /(^|\s)((?:pk:|pubky)[a-z0-9]{52})/g,
  getUrl: (mention: string) => {
    // Extract the public key without the prefix (pk: or pubky)
    const publicKey = mention.startsWith('pk:') ? mention.slice(3) : mention.slice(5);
    return `/profile/${encodeURIComponent(publicKey)}`;
  },
  dataType: 'mention',
});

// Add a "Show more" button element inside the last paragraph for inline display.
// Uses a Link node with data-type="show-more-button" so it can be rendered as a
// button via react-markdown's components prop (same pattern as hashtags/mentions).
// Placed inside the last paragraph to appear inline after text, but not inside
// styled elements like code blocks, blockquotes, etc.
export const remarkShowMoreButton = () => (tree: Root) => {
  // Find the last paragraph in the document
  const lastParagraph = tree.children.findLast((child) => child.type === 'paragraph');

  // Create a link node with data-type for component routing in react-markdown
  // Using href="#" as a placeholder since it will be rendered as a button
  const showMoreNode: Link = {
    type: 'link',
    url: '#',
    data: {
      hProperties: {
        'data-type': 'show-more-button',
      },
    },
    children: [{ type: 'text', value: 'Show more' } as Text],
  };

  if (lastParagraph) {
    // Append inside the last paragraph for inline display
    lastParagraph.children.push(showMoreNode);
  } else {
    // Fallback: No paragraph found, wrap in a new paragraph
    const newParagraph: Paragraph = {
      type: 'paragraph',
      children: [showMoreNode],
    };

    tree.children.push(newParagraph);
  }
};

// Extract text safely - children from remark is typically a text node
export const extractTextFromChildren = (children: ReactNode) =>
  typeof children === 'string'
    ? children
    : Array.isArray(children) && typeof children[0] === 'string'
      ? children[0]
      : '';

// Truncate text at word boundaries to avoid cutting mid-word, mid-markdown, or mid-URL.
// Falls back to hard cut if no suitable word boundary is found within 80% of the limit.
export const truncateAtWordBoundary = (text: string, limit: number): string => {
  if (text.length <= limit) return text;

  const truncated = text.slice(0, limit);
  const lastSpace = truncated.lastIndexOf(' ');

  // Only use word boundary if it's within 80% of the limit to avoid too-short truncation
  const minBoundary = Math.floor(limit * 0.8);

  return (lastSpace > minBoundary ? truncated.slice(0, lastSpace) : truncated) + '...\u00A0';
};
