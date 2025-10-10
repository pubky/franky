import * as Core from '@/core';
import * as Libs from '@/libs';
import type { TLocalSaveTagParams, TLocalRemoveTagParams } from './tag.types';
import { UserCountsFields } from '@/core/models/user/counts/userCounts.schema';
import { traceAsync } from '../../../../../benchmarks/runtime';

export class LocalTagService {
  /**
   * Adds a tag to a post and updates all related counts.
   *
   * - Adds the tagger to the specified tag
   * - Updates post counts (total tags, unique tags)
   * - Increments the tagger's tagged count
   *
   * @param params.postId - Unique identifier of the post to tag
   * @param params.label - Normalized tag label (must be pre-normalized by caller)
   * @param params.taggerId - Unique identifier of the user adding the tag
   *
   * @throws {AppError} When user has already tagged this post with the same label
   * @throws {DatabaseError} When database operations fail
   */
  static async create({ postId, label, taggerId }: TLocalSaveTagParams) {
    return traceAsync(
      'local-service',
      'LocalTagService.create',
      async () => {
        try {
          const tagsData = await Core.PostTagsModel.findById(postId);

          const postTagsModel = tagsData
            ? new Core.PostTagsModel(tagsData)
            : new Core.PostTagsModel({ id: postId, tags: [] });

          postTagsModel.saveTag(label, taggerId);

          await Core.PostTagsModel.upsert({
            id: postId,
            tags: postTagsModel.tags as Core.NexusTag[],
          });

          await this.updatePostCounts(postId, postTagsModel);

          const tagger = await Core.UserCountsModel.findById(taggerId);
          if (tagger) {
            tagger.updateCount(UserCountsFields.TAGGED, Core.INCREMENT);
            await Core.UserCountsModel.update(taggerId, { [UserCountsFields.TAGGED]: tagger.tagged });
          }

          Libs.Logger.debug('Tag saved', { postId, label, taggerId });
        } catch (error) {
          throw Libs.createDatabaseError(
            Libs.DatabaseErrorType.UPDATE_FAILED,
            `Failed to save tag to PostTagsModel`,
            500,
            {
              error,
              postId,
              label,
              taggerId,
            },
          );
        }
      },
      { postId, label },
    );
  }

  /**
   * Removes a tag from a post and updates all related counts.
   *
   * - Removes the tagger from the specified tag
   * - Updates post counts (total tags, unique tags)
   * - Decrements the tagger's tagged count
   * - Removes the tag entirely if no taggers remain
   *
   * @param params.postId - Unique identifier of the post to remove tag from
   * @param params.label - Tag label to remove
   * @param params.taggerId - Unique identifier of the user removing the tag
   *
   * @throws {AppError} When post has no tags or user hasn't tagged with this label
   * @throws {DatabaseError} When database operations fail
   */
  static async delete({ postId, label, taggerId }: TLocalRemoveTagParams) {
    return traceAsync(
      'local-service',
      'LocalTagService.delete',
      async () => {
        try {
          const tagsData = await Core.PostTagsModel.findById(postId);

          if (!tagsData) {
            throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, `Post has no tags`, 404, { postId });
          }

          const postTagsModel = new Core.PostTagsModel(tagsData);

          postTagsModel.removeTag(label, taggerId);

          await Core.PostTagsModel.upsert({
            id: postId,
            tags: postTagsModel.tags as Core.NexusTag[],
          });

          await this.updatePostCounts(postId, postTagsModel);

          const tagger = await Core.UserCountsModel.findById(taggerId);
          if (tagger) {
            tagger.updateCount(UserCountsFields.TAGGED, Core.DECREMENT);
            await Core.UserCountsModel.update(taggerId, { [UserCountsFields.TAGGED]: tagger.tagged });
          }

          Libs.Logger.debug('Tag removed', { postId, label, taggerId });
        } catch (error) {
          throw Libs.createDatabaseError(
            Libs.DatabaseErrorType.UPDATE_FAILED,
            `Failed to remove tag from PostTagsModel`,
            500,
            { error, postId, label, taggerId },
          );
        }
      },
      { postId, label },
    );
  }

  /**
   * Updates post counts based on the current tag state.
   *
   * This helper method calculates and updates the total tags and unique tags
   * for a post based on the current PostTagsModel state.
   *
   * @param postId - Unique identifier of the post
   * @param postTagsModel - The PostTagsModel instance with current tag data
   *
   * @private
   */
  static async updatePostCounts(postId: Core.Pubky, postTagsModel: Core.PostTagsModel) {
    return traceAsync(
      'local-service',
      'LocalTagService.updatePostCounts',
      async () => {
        const tags = postTagsModel.tags.reduce((sum, tag) => sum + tag.taggers_count, 0);
        const unique_tags = postTagsModel.tags.length;

        const countsExist = await Core.PostCountsModel.findById(postId);
        if (countsExist) {
          await Core.PostCountsModel.update(postId, {
            tags,
            unique_tags,
          });
        } else {
          // TODO(core): Fetch counts from Nexus and reconcile local tag counts.
          // This prevents drift between local Dexie state and the upstream source of truth.
          await Core.PostCountsModel.upsert({
            id: postId,
            tags,
            unique_tags,
            replies: 0,
            reposts: 0,
          });
        }
      },
      { postId },
    );
  }
}
