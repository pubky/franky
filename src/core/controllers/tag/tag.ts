import { Logger } from '@/libs';
import * as Core from '@/core';

export class TagController {
  private static isInitialized = false;

  private constructor() {}

  private static async initialize(): Promise<void> {
    if (!this.isInitialized) {
      await Core.db.initialize();
      this.isInitialized = true;
    }
  }

  /**
   * Add a tag
   * @param targetId - ID of the post or user to tag
   * @param label - Tag label
   * @param taggerId - ID of the user adding the tag
   * @returns true if tag was added, false if it already exists
   */
  static async add(targetId: string, label: string, taggerId: Core.Pubky): Promise<boolean> {
    await this.initialize();

    const postDetails = await Core.PostDetailsModel.table.get(targetId);
    if (!postDetails) {
      Logger.debug('Post not found for addTag', { targetId });
      return false;
    }

    const normalizedTag = await Core.TagNormalizer.to(postDetails.uri, label.trim(), taggerId);
    const normalizedLabel = normalizedTag.tag.label.toLowerCase();

    return Core.LocalDb.Tag.save({ postId: targetId, label: normalizedLabel, taggerId });
  }

  /**
   * Remove a tag
   * @param targetId - ID of the post or user
   * @param label - Tag label to remove
   * @param taggerId - ID of the user removing the tag
   * @returns true if tag was removed, false if not found
   */
  static async remove(targetId: string, label: string, taggerId: Core.Pubky): Promise<boolean> {
    await this.initialize();

    const postDetails = await Core.PostDetailsModel.table.get(targetId);
    if (!postDetails) {
      Logger.debug('Post not found for removeTag', { targetId });
      return false;
    }

    const normalizedTag = await Core.TagNormalizer.to(postDetails.uri, label.trim(), taggerId);
    const normalizedLabel = normalizedTag.tag.label.toLowerCase();

    return Core.LocalDb.Tag.remove({ postId: targetId, label: normalizedLabel, taggerId });
  }

  /**
   * Get all tags
   * @param targetId - ID of the post or user
   * @returns Array of TagModel objects
   */
  static async get(targetId: string): Promise<Core.TagModel[]> {
    await this.initialize();
    return Core.LocalDb.Tag.get({ postId: targetId });
  }
}
