import * as Core from '@/core';

import { postUriBuilder, PubkyAppTag, userUriBuilder } from 'pubky-app-specs';

export class TagController {
  private constructor() {}

  /**
   * Create a tag
   * @param params - Parameters object
   * @param params.targetId - ID of the post or user to tag
   * @param params.label - Tag label
   * @param params.taggerId - ID of the user adding the tag
   */
  static async create(params: Core.TTagEventParams) {

    const { tagUrl, tag } = await TagController.generateTagUri(params);
    const { taggedId, taggedKind, taggerId } = params;

    // Use composite targetId for local persistence to align with delete flow and tests
    await Core.TagApplication.create({
      taggerId,
      taggedId,
      label: tag.label.toLowerCase(),
      taggedKind,
      tagUrl,
      tagJson: tag.toJson(),
    });
  }

  /**
   * Delete a tag
   * @param params - Parameters object
   * @param params.targetId - ID of the post or user
   * @param params.label - Tag label to remove
   * @param params.taggerId - ID of the user removing the tag
   */
  static async delete(params: Core.TTagEventParams) {

    const { tagUrl, tag } = await TagController.generateTagUri(params);
    const { taggerId, taggedId, taggedKind } = params;

    await Core.TagApplication.delete({
      taggedId,
      label: tag.label.toLowerCase(),
      taggedKind,
      taggerId,
      tagUrl,
    });
  }

  private static async generateTagUri({ taggedId, label, taggerId, taggedKind }: Core.TTagEventParams): Promise<{ tagUrl: string, tag: PubkyAppTag }> {
    let uri: string;
    if (taggedKind === Core.TagKind.POST) {
      const { pubky, postId } = Core.parsePostCompositeId(taggedId);
      uri = postUriBuilder(pubky, postId);
    } else {
      uri = userUriBuilder(taggedId);
    }
    const { tag, meta } = await Core.TagNormalizer.to(uri, label.trim(), taggerId);
    return { tagUrl: meta.url, tag };
  }
}
