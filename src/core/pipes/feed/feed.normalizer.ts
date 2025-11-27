import { FeedResult, PubkyAppFeedLayout } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

const MIN_TAGS = 1;
const MAX_TAGS = 5;

export class FeedNormalizer {
  private constructor() {}

  /**
   * Validates and normalizes feed input using pubky-app-specs builder.
   * Returns FeedResult with validated feed and meta (id, path, url).
   */
  static to(params: Core.TFeedCreateParams, userId: Core.Pubky): FeedResult {
    // Validate tags (specs may not enforce minimum)
    if (!params.tags || params.tags.length < MIN_TAGS) {
      throw new Error('At least one tag is required');
    }
    if (params.tags.length > MAX_TAGS) {
      throw new Error(`Maximum ${MAX_TAGS} tags allowed`);
    }

    // Normalize tags (trim, lowercase, filter empty, dedupe)
    const normalizedTags = [...new Set(params.tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0))];

    // Re-validate after deduplication
    if (normalizedTags.length < MIN_TAGS) {
      throw new Error('At least one unique tag is required');
    }

    // Map layout (Focus -> Visual for homeserver storage)
    const layout: PubkyAppFeedLayout =
      params.layout === Core.FeedLayout.FOCUS
        ? PubkyAppFeedLayout.Visual
        : (params.layout as unknown as PubkyAppFeedLayout);

    // Map content (null -> null for specs, convert number to string if present)
    const content = params.content !== null ? Core.postKindToString(params.content) : null;

    // Use pubky-app-specs builder for validation
    const builder = Core.PubkySpecsSingleton.get(userId);
    const result = builder.createFeed(
      normalizedTags,
      Core.reachToString(params.reach),
      Core.layoutToString(layout),
      Core.sortToString(params.sort),
      content,
      params.name.trim(),
    );

    Libs.Logger.debug('Feed validated', { result });
    return result;
  }
}
