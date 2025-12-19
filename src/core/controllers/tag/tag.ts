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
  static async commitCreate(params: Core.TTagEventParams) {
    const tag = Core.TagNormalizer.from(params);

    await Core.TagApplication.commitCreate({ tagList: [tag] });
  }

  /**
   * Delete a tag
   * @param params - Parameters object
   * @param params.targetId - ID of the post or user
   * @param params.label - Tag label to remove
   * @param params.taggerId - ID of the user removing the tag
   */
  static async commitDelete(params: Core.TTagEventParams) {
    const { tagUrl, label, taggerId, taggedId, taggedKind } = Core.TagNormalizer.from(params);

    await Core.TagApplication.commitDelete({
      taggedId,
      label,
      taggedKind,
      taggerId,
      tagUrl,
    });
  }
}
