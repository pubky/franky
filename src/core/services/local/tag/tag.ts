import * as Core from '@/core';
import { Logger } from '@/libs';
import type { TLocalSaveTagParams, TLocalRemoveTagParams } from './tag.types';

export class LocalTagService {
  /**
   * Add a tag to a post
   * @param params - Parameters object
   * @param params.postId - ID of the post to tag
   * @param params.label - Normalized tag label (should already be normalized by caller)
   * @param params.taggerId - ID of the user adding the tag
   */
  static async save({ postId, label, taggerId }: TLocalSaveTagParams) {
    const tagsData = await Core.PostTagsModel.table.get(postId);

    const postTagsModel = tagsData
      ? new Core.PostTagsModel(tagsData)
      : new Core.PostTagsModel({ id: postId, tags: [] });

    postTagsModel.saveTag(label, taggerId);

    await Core.PostTagsModel.insert({
      id: postId,
      tags: postTagsModel.tags as Core.NexusTag[],
    });

    const counts = await Core.PostCountsModel.table.get(postId);
    if (counts) {
      await Core.PostCountsModel.insert({
        ...counts,
        tags: postTagsModel.tags.reduce((sum, tag) => sum + tag.taggers_count, 0),
        unique_tags: postTagsModel.tags.length,
      });
    }

    Logger.debug('Tag saved', { postId, label, taggerId });
  }

  /**
   * Remove a tag from a post
   * @param params - Parameters object
   * @param params.postId - ID of the post
   * @param params.label - Normalized tag label (should already be normalized by caller)
   * @param params.taggerId - ID of the user removing the tag
   */
  static async remove({ postId, label, taggerId }: TLocalRemoveTagParams) {
    const tagsData = await Core.PostTagsModel.table.get(postId);

    if (!tagsData) {
      throw new Error('Post has no tags');
    }

    const postTagsModel = new Core.PostTagsModel(tagsData);

    postTagsModel.removeTag(label, taggerId);

    await Core.PostTagsModel.insert({
      id: postId,
      tags: postTagsModel.tags as Core.NexusTag[],
    });

    const counts = await Core.PostCountsModel.table.get(postId);
    if (counts) {
      await Core.PostCountsModel.insert({
        ...counts,
        tags: postTagsModel.tags.reduce((sum, tag) => sum + tag.taggers_count, 0),
        unique_tags: postTagsModel.tags.length,
      });
    }

    Logger.debug('Tag removed', { postId, label, taggerId });
  }
}
