import * as Core from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';

export class LocalTagService {
  /**
   * Add a tag to a post
   * @param params - Parameters object
   * @param params.postId - ID of the post to tag
   * @param params.label - Normalized tag label (should already be normalized by caller)
   * @param params.taggerId - ID of the user adding the tag
   */
  static async save({
    postId,
    label,
    taggerId,
  }: {
    postId: string;
    label: string;
    taggerId: Core.Pubky;
  }): Promise<void> {
    try {
      const tagsData = await Core.PostTagsModel.table.get(postId);

      if (tagsData) {
        const postTagsModel = new Core.PostTagsModel(tagsData);

        const existingTag = postTagsModel.tags.find((t) => t.label === label);
        if (existingTag?.relationship) {
          throw createDatabaseError(
            DatabaseErrorType.SAVE_FAILED,
            'User already tagged this post with this label',
            400,
            { postId, label, taggerId },
          );
        }

        const added = postTagsModel.addTagger(label, taggerId);
        if (!added) {
          throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, 'Failed to add tagger', 500, {
            postId,
            label,
            taggerId,
          });
        }

        const updatedTag = postTagsModel.tags.find((t) => t.label === label);
        if (updatedTag) {
          updatedTag.relationship = true;
        }

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

        Logger.debug('Added tagger using existing PostTagsModel', { postId, label, taggerId });
        return;
      }

      const newPostTags = new Core.PostTagsModel({
        id: postId,
        tags: [],
      });

      const added = newPostTags.addTagger(label, taggerId);
      if (!added) {
        throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, 'Failed to add tagger', 500, {
          postId,
          label,
          taggerId,
        });
      }

      const newTag = newPostTags.tags.find((t) => t.label === label);
      if (newTag) {
        newTag.relationship = true;
      }

      await Core.PostTagsModel.insert({
        id: postId,
        tags: newPostTags.tags as Core.NexusTag[],
      });

      const counts = await Core.PostCountsModel.table.get(postId);
      if (counts) {
        await Core.PostCountsModel.insert({
          ...counts,
          tags: newPostTags.tags.reduce((sum, tag) => sum + tag.taggers_count, 0),
          unique_tags: newPostTags.tags.length,
        });
      }

      Logger.debug('Created new PostTagsModel and added tag', { postId, label, taggerId });
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, 'Failed to add tag to post', 500, {
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
  static async remove({
    postId,
    label,
    taggerId,
  }: {
    postId: string;
    label: string;
    taggerId: Core.Pubky;
  }): Promise<void> {
    try {
      const tagsData = await Core.PostTagsModel.table.get(postId);

      if (!tagsData) {
        throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, 'Post has no tags', 404, { postId });
      }

      const postTagsModel = new Core.PostTagsModel(tagsData);

      const existingTag = postTagsModel.tags.find((t) => t.label === label);
      if (!existingTag?.relationship) {
        throw createDatabaseError(
          DatabaseErrorType.DELETE_FAILED,
          'User has not tagged this post with this label',
          404,
          { postId, label, taggerId },
        );
      }

      const removed = postTagsModel.removeTagger(label, taggerId);
      if (!removed) {
        throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, 'Failed to remove tagger', 500, {
          postId,
          label,
          taggerId,
        });
      }

      const updatedTag = postTagsModel.tags.find((t) => t.label === label);
      if (updatedTag) {
        updatedTag.relationship = false;
      }

      postTagsModel.tags = postTagsModel.tags.filter((tag) => tag.taggers_count > 0);

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

      Logger.debug('Removed tagger using PostTagsModel', { postId, label, taggerId });
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, 'Failed to remove tag from post', 500, {
        error,
        postId,
        label,
        taggerId,
      });
    }
  }
}
