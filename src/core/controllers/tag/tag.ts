import { postUriBuilder } from 'pubky-app-specs';

import * as Core from '@/core';

export class TagController {
  private constructor() {}

  /**
   * Create a tag
   * @param params - Parameters object
   * @param params.targetId - ID of the post or user to tag
   * @param params.label - Tag label
   * @param params.taggerId - ID of the user adding the tag
   */
  static async create({ targetId, label, taggerId }: Core.TCreateTagParams) {
    const { pubky, postId } = Core.parsePostCompositeId(targetId);
    const postUri = postUriBuilder(pubky, postId);

    const normalizedTag = await Core.TagNormalizer.to(postUri, label.trim(), taggerId);
    const normalizedLabel = normalizedTag.tag.label.toLowerCase();

    // Use composite targetId for local persistence to align with delete flow and tests
    await Core.TagApplication.create({
      postId: targetId,
      label: normalizedLabel,
      taggerId,
      tagUrl: normalizedTag.meta.url,
      tagJson: normalizedTag.tag.toJson(),
    });
  }

  /**
   * Delete a tag
   * @param params - Parameters object
   * @param params.targetId - ID of the post or user
   * @param params.label - Tag label to remove
   * @param params.taggerId - ID of the user removing the tag
   */
  static async delete({ targetId, label, taggerId }: Core.TDeleteTagParams) {
    const { pubky, postId } = Core.parsePostCompositeId(targetId);
    const postUri = postUriBuilder(pubky, postId);

    const normalizedTag = await Core.TagNormalizer.to(postUri, label.trim(), taggerId);
    const normalizedLabel = normalizedTag.tag.label.toLowerCase();

    await Core.TagApplication.delete({
      postId: targetId,
      label: normalizedLabel,
      taggerId,
      tagUrl: normalizedTag.meta.url,
    });
  }
}
