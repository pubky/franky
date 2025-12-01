import { FeedResult } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export type TFeedNormalizerInput = {
  params: Core.TFeedCreateParams;
  userId: Core.Pubky;
};

export class FeedNormalizer {
  private constructor() {}

  static to({ params, userId }: TFeedNormalizerInput): FeedResult {
    // Normalize tags to ensure consistent format: lowercase, trim whitespace, remove duplicates and empty strings
    const normalizedTags = [...new Set(params.tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0))];

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

    Libs.Logger.debug('Feed normalized', { result });
    return result;
  }
}
