import * as Core from '@/core';
import * as Libs from '@/libs';

export class LocalPostTagService {
  private static readonly TAG_TABLES = [
    Core.PostTagsModel.table,
    Core.PostCountsModel.table,
    Core.UserCountsModel.table,
  ] as const;
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
  static async create({ taggedId: postId, label, taggerId }: Core.TLocalTagParams) {
    try {
      await Core.db.transaction('rw', this.TAG_TABLES, async () => {
        const postTagsModel = await Core.PostTagsModel.getOrCreate<string, Core.PostTagsModelSchema>(postId);
        let status = postTagsModel.addTagger(label, taggerId);
        // Ignore all the operations
        if (status === null) {
          Libs.Logger.debug('User already tagged this post with this label', { postId, label, taggerId });
          return;
        }
        await Promise.all([
          this.savePostTagsModel(postId, postTagsModel),
          this.updatePostCounts(postId, postTagsModel),
          Core.updateTaggerCount(taggerId, Core.INCREMENT),
        ]);

        Libs.Logger.debug('Post tag created', { postId, label, taggerId });
      });
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.UPDATE_FAILED, `Failed to create post tag`, 500, {
        error,
        postId,
        label,
        taggerId,
      });
    }
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
  static async delete({ taggedId: postId, label, taggerId }: Core.TLocalTagParams) {
    try {
      await Core.db.transaction('rw', this.TAG_TABLES, async () => {
        const tagsData = await Core.PostTagsModel.findById(postId);

        if (!tagsData) {
          throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, `Post has no tags`, 404, { postId });
        }

        const postTagsModel = new Core.PostTagsModel(tagsData);

        postTagsModel.removeTagger(label, taggerId);

        await this.savePostTagsModel(postId, postTagsModel);
        await this.updatePostCounts(postId, postTagsModel);
        await Core.updateTaggerCount(taggerId, Core.DECREMENT);

        Libs.Logger.debug('Tag removed', { postId, label, taggerId });
      });
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.UPDATE_FAILED, `Failed to delete post tag`, 500, {
        error,
        postId,
        label,
        taggerId,
      });
    }
  }

  /**
   * Saves the PostTagsModel to the database.
   *
   * @param postId - Unique identifier of the post
   * @param postTagsModel - The PostTagsModel instance to save
   * @private
   */
  private static async savePostTagsModel(postId: string, postTagsModel: Core.PostTagsModel) {
    await Core.PostTagsModel.upsert({
      id: postId,
      tags: postTagsModel.tags as Core.NexusTag[],
    });
  }

  /**
   * Updates post counts based on the current tag state.
   *
   * This helper method calculates and updates the total tags and unique tags
   * for a post based on the current PostTagsModel state.
   *
   * @param postId - Unique identifier of the post
   * @param postTagsModel - The PostTagsModel instance with current tag data
   * @private
   */
  private static async updatePostCounts(postId: Core.Pubky, postTagsModel: Core.PostTagsModel) {
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
  }
}
