import type { Root, Paragraph, Text, Link, PhrasingContent } from 'mdast';
import { visit } from 'unist-util-visit';

// We assign full code blocks without a language specified as plaintext (ex. ```...```)
export const remarkPlaintextCodeblock = () => (tree: Root) => {
  visit(tree, 'code', (node) => {
    node.lang = node.lang ?? 'plaintext';
  });
};

// Parse hashtags in paragraph text nodes and convert them to links with data-type="hashtag"
export const remarkHashtags = () => (tree: Root) => {
  // Hashtag pattern: # followed by a letter, then letters/numbers/underscores
  // Must be at start of text or preceded by whitespace (standalone)
  const hashtagRegex = /(^|\s)(#[a-zA-Z][a-zA-Z0-9_]*)/g;

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

      for (const match of text.matchAll(hashtagRegex)) {
        hasChanges = true;
        const [fullMatch, leadingWhitespace, hashtag] = match;
        const matchStart = match.index;

        // Add text before the match (including any leading whitespace from the match)
        const textBefore = text.slice(lastIndex, matchStart) + leadingWhitespace;
        if (textBefore) {
          segments.push({
            type: 'text',
            value: textBefore,
          } as Text);
        }

        // Extract tag name without the # symbol for the URL
        const tagName = hashtag.slice(1);

        // Create a link node with data-type="hashtag" for differentiation
        segments.push({
          type: 'link',
          url: `/search?tags=${encodeURIComponent(tagName)}`,
          data: {
            hProperties: {
              'data-type': 'hashtag',
            },
          },
          children: [{ type: 'text', value: hashtag } as Text],
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

      // If we found hashtags, use the segments; otherwise keep original child
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
