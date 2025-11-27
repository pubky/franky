import { FeedResult } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

const MIN_TAGS = 1;
const MAX_TAGS = 5;

export class FeedNormalizer {
  private constructor() {}

  static to(params: Core.TFeedCreateParams, userId: Core.Pubky): FeedResult {
    if (!params.tags || params.tags.length < MIN_TAGS) {
      throw new Error('At least one tag is required');
    }
    if (params.tags.length > MAX_TAGS) {
      throw new Error(`Maximum ${MAX_TAGS} tags allowed`);
    }

    const normalizedTags = [...new Set(params.tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0))];

    if (normalizedTags.length < MIN_TAGS) {
      throw new Error('At least one unique tag is required');
    }

    const content = params.content !== null ? Core.postKindToString(params.content) : null;

    const builder = Core.PubkySpecsSingleton.get(userId);
    const result = builder.createFeed(
      normalizedTags,
      Core.reachToString(params.reach),
      Core.layoutToString(params.layout),
      Core.sortToString(params.sort),
      content,
      params.name.trim(),
    );

    Libs.Logger.debug('Feed validated', { result });
    return result;
  }
}
