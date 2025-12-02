import { ReactNode } from 'react';
import type { MdastNode, TextNode, LinkNode, CodeNode, ParagraphNode, RootNode } from './PostText.types';

// ============================================================================
// Tree Visitor Utility
// ============================================================================

/** Simple tree visitor - traverses all nodes and calls callback for matching types */
const visit = <T extends MdastNode>(tree: MdastNode, type: string, callback: (node: T) => void): void => {
  const walk = (node: MdastNode) => {
    if (node.type === type) {
      callback(node as T);
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  };
  walk(tree);
};

// ============================================================================
// Remark Plugins
// ============================================================================

/** Assigns 'plaintext' language to code blocks without a language specified */
export const remarkPlaintextCodeblock = () => (tree: RootNode) => {
  visit<CodeNode>(tree, 'code', (node) => {
    node.lang = node.lang ?? 'plaintext';
  });
};

/** Configuration for pattern-matching remark plugins */
interface PatternPluginConfig {
  /** Regex to match - must have capture groups: (leadingWhitespace)(fullMatch) */
  regex: RegExp;
  /** Function to generate the URL from the matched text */
  getUrl: (match: string) => string;
  /** The data-type attribute value for the link */
  dataType: string;
}

/** Factory function that creates a remark plugin for pattern matching and link conversion */
const createPatternPlugin = (config: PatternPluginConfig) => {
  const { regex, getUrl, dataType } = config;

  return () => (tree: RootNode) => {
    visit<ParagraphNode>(tree, 'paragraph', (node) => {
      const newChildren: MdastNode[] = [];
      let hasChanges = false;

      for (const child of node.children) {
        // Only process direct text children to avoid false positives in URLs, code, etc.
        if (child.type !== 'text') {
          newChildren.push(child);
          continue;
        }

        const textNode = child as TextNode;
        const text = textNode.value;
        const segments: MdastNode[] = [];
        let lastIndex = 0;

        for (const match of text.matchAll(regex)) {
          hasChanges = true;
          const [fullMatch, leadingWhitespace, matchedText] = match;
          const matchStart = match.index;

          // Add text before the match (including any leading whitespace from the match)
          const textBefore = text.slice(lastIndex, matchStart) + leadingWhitespace;
          if (textBefore) {
            segments.push({ type: 'text', value: textBefore } satisfies TextNode);
          }

          // Create a link node with the appropriate data-type for differentiation
          segments.push({
            type: 'link',
            url: getUrl(matchedText),
            data: { hProperties: { 'data-type': dataType } },
            children: [{ type: 'text', value: matchedText } satisfies TextNode],
          } satisfies LinkNode);

          lastIndex = matchStart + fullMatch.length;
        }

        // Add any remaining text after the last match
        if (lastIndex < text.length) {
          segments.push({ type: 'text', value: text.slice(lastIndex) } satisfies TextNode);
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
// Hashtag pattern: # followed by a letter, then letters/numbers/underscores
// Must be at start of text or preceded by whitespace (standalone)
export const remarkHashtags = createPatternPlugin({
  regex: /(^|\s)(#[a-zA-Z][a-zA-Z0-9_]*)/g,
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

// Extract text safely - children from remark is typically a text node
export const extractTextFromChildren = (children: ReactNode) =>
  typeof children === 'string'
    ? children
    : Array.isArray(children) && typeof children[0] === 'string'
      ? children[0]
      : '';
