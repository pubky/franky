import * as Core from '@/core';
import * as Libs from '@/libs';
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
    try {
      const tagsData = await Core.PostTagsModel.findById(postId);

      const postTagsModel = tagsData
        ? new Core.PostTagsModel(tagsData)
        : new Core.PostTagsModel({ id: postId, tags: [] });

      postTagsModel.saveTag(label, taggerId);

      await Core.PostTagsModel.insert({
        id: postId,
        tags: postTagsModel.tags as Core.NexusTag[],
      });

      await this.updatePostCounts(postId, postTagsModel);

      // TODO: Search the tagger counts and add in its profileCounts + 1

      Libs.Logger.debug('Tag saved', { postId, label, taggerId });
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.UPDATE_FAILED, `Failed to save tag to PostTagsModel`, 500, {
        error,
        postId,
        label,
        taggerId,
      });
    }
  }

  /**
   * Remove a tag from a post
   * @param params - Parameters object
   * @param params.postId - ID of the post
   * @param params.label - Normalized tag label (should already be normalized by caller)
   * @param params.taggerId - ID of the user removing the tag
   */
  static async remove({ postId, label, taggerId }: TLocalRemoveTagParams) {
    try {
      const tagsData = await Core.PostTagsModel.findById(postId);

      if (!tagsData) {
        throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, `Post has no tags`, 404, { postId });
      }

      const postTagsModel = new Core.PostTagsModel(tagsData);

      postTagsModel.removeTag(label, taggerId);

      await Core.PostTagsModel.insert({
        id: postId,
        tags: postTagsModel.tags as Core.NexusTag[],
      });

      await this.updatePostCounts(postId, postTagsModel);

      // TODO: Search the tagger counts and remove in its profileCounts - 1

      Libs.Logger.debug('Tag removed', { postId, label, taggerId });
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.UPDATE_FAILED,
        `Failed to remove tag from PostTagsModel`,
        500,
        { error, postId, label, taggerId },
      );
    }
  }

  static async updatePostCounts(postId: Core.Pubky, postTagsModel: Core.PostTagsModel) {
    const tags = postTagsModel.tags.reduce((sum, tag) => sum + tag.taggers_count, 0);
    const unique_tags = postTagsModel.tags.length;

    const countsExist = await Core.PostCountsModel.findById(postId);
    if (countsExist) {
      await Core.PostCountsModel.insert({
        ...countsExist!,
        tags,
        unique_tags,
      });
    } else {
      // TODO(core): Fetch counts from Nexus and reconcile local tag counts.
      // This prevents drift between local Dexie state and the upstream source of truth.
      await Core.PostCountsModel.insert({
        id: postId,
        tags,
        unique_tags,
        replies: 0,
        reposts: 0,
      });
    }
  }
}
