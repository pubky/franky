import { postUriBuilder } from 'pubky-app-specs';
import * as Core from '@/core';
import type { TAddTagParams, TRemoveTagParams } from './tag.types';

export class TagController {
  private static isInitialized = false;

  private constructor() {}

  private static async initialize() {
    if (!this.isInitialized) {
      await Core.db.initialize();
      this.isInitialized = true;
    }
  }

  /**
   * Add a tag
   * @param params - Parameters object
   * @param params.targetId - ID of the post or user to tag
   * @param params.label - Tag label
   * @param params.taggerId - ID of the user adding the tag
   */
  static async add({ targetId, label, taggerId }: TAddTagParams) {
    await this.initialize();

    const target = targetId.split(':');
    const postUri = postUriBuilder(target[0], target[1]);

    const normalizedTag = await Core.TagNormalizer.to(postUri, label.trim(), taggerId);
    const normalizedLabel = normalizedTag.tag.label.toLowerCase();

    await Core.Local.Tag.save({ postId: targetId, label: normalizedLabel, taggerId });
  }

  /**
   * Remove a tag
   * @param params - Parameters object
   * @param params.targetId - ID of the post or user
   * @param params.label - Tag label to remove
   * @param params.taggerId - ID of the user removing the tag
   */
  static async remove({ targetId, label, taggerId }: TRemoveTagParams) {
    await this.initialize();

    const target = targetId.split(':');
    const postUri = postUriBuilder(target[0], target[1]);

    const normalizedTag = await Core.TagNormalizer.to(postUri, label.trim(), taggerId);
    const normalizedLabel = normalizedTag.tag.label.toLowerCase();

    await Core.Local.Tag.remove({ postId: targetId, label: normalizedLabel, taggerId });
  }
}
