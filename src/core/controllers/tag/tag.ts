import { postUriBuilder } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Application from '@/core/application';
import type { TCreateTagParams, TDeleteTagParams } from './tag.types';

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
   * Create a tag
   * @param params - Parameters object
   * @param params.targetId - ID of the post or user to tag
   * @param params.label - Tag label
   * @param params.taggerId - ID of the user adding the tag
   */
  static async create({ targetId, label, taggerId }: TCreateTagParams) {
    await this.initialize();

    const target = targetId.split(':');
    const postUri = postUriBuilder(target[0], target[1]);

    const normalizedTag = await Core.TagNormalizer.to(postUri, label.trim(), taggerId);
    const normalizedLabel = normalizedTag.tag.label.toLowerCase();

    await Application.Tag.create({
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
  static async delete({ targetId, label, taggerId }: TDeleteTagParams) {
    await this.initialize();

    const target = targetId.split(':');
    const postUri = postUriBuilder(target[0], target[1]);

    const normalizedTag = await Core.TagNormalizer.to(postUri, label.trim(), taggerId);
    const normalizedLabel = normalizedTag.tag.label.toLowerCase();

    await Application.Tag.delete({
      postId: targetId,
      label: normalizedLabel,
      taggerId,
      tagUrl: normalizedTag.meta.url,
    });
  }
}
