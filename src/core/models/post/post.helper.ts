import { Pubky } from '@/core';

export const POST_ID_DELIMITER = ':' as const;

export type PostIdParts = {
  pubky: Pubky;
  postId: string;
}

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
    const pubky = parsed.hostname;
    const segments = parsed.pathname.split('/').filter(Boolean);
    const postsIndex = segments.lastIndexOf('posts');
    const postId = postsIndex !== -1 ? segments[postsIndex + 1] : undefined;

    if (!pubky || !postId) {
      return null;
    }

    return buildPostCompositeId({ pubky, postId })
  } catch {
    return null;
  }
}

export function buildPostCompositeId({ pubky, postId }: PostIdParts): string {
  return `${pubky}${POST_ID_DELIMITER}${postId}`;
}

export function parsePostCompositeId(compositePostId: string): PostIdParts {
  const sep = compositePostId.indexOf(POST_ID_DELIMITER);
  if (sep <= 0 || sep === compositePostId.length - 1) {
    throw new Error(`Invalid Post composite id: ${compositePostId}`);
  }
  const pubky = compositePostId.substring(0, sep) as Pubky;
  const postId = compositePostId.substring(sep + 1);
  return { pubky, postId };
}