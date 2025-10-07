/**
 * Extracts a post ID from a Pubky URI
 *
 * Parses a pubky:// URI to extract the author and post ID,
 * combining them into the canonical format "author:postId"
 *
 * @param uri - A pubky URI (e.g., "pubky://author/pub/pubky.app/posts/post123")
 * @returns Post ID in "author:postId" format, or null if parsing fails
 *
 * @example
 * buildPostIdFromUri("pubky://author123/pub/pubky.app/posts/post456")
 * // Returns: "author123:post456"
 */
export function buildPostIdFromPubkyUri(uri: string): string | null {
  try {
    const parsed = new URL(uri);
    const author = parsed.hostname;
    const segments = parsed.pathname.split('/').filter(Boolean);
    const postsIndex = segments.lastIndexOf('posts');
    const postSegment = postsIndex !== -1 ? segments[postsIndex + 1] : undefined;

    if (!author || !postSegment) {
      return null;
    }

    return `${author}:${postSegment}`;
  } catch {
    return null;
  }
}

/**
 * Normalizes PubkyAppPost kind string to lowercase internal format
 *
 * The pubky-app-specs library returns kind as a string ('Short', 'Long', 'Image', etc.)
 * but our internal types use lowercase ('short', 'long', 'image', etc.)
 *
 * @param kind - Kind string from PubkyAppPost (e.g., 'Short', 'Long')
 * @returns Normalized lowercase kind string
 */
export function normalizePostKind(kind: string): string {
  return kind.toLowerCase();
}
