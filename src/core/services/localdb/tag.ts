import * as Core from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';

export class LocalDbTagService {
  /**
   * Add a tag to a post
   * @param params - Parameters object
   * @param params.postId - ID of the post to tag
   * @param params.label - Normalized tag label (should already be normalized by caller)
   * @param params.taggerId - ID of the user adding the tag
   * @returns true if tag was added, false if it already exists
   */
  static async save({
    postId,
    label,
    taggerId,
  }: {
    postId: string;
    label: string;
    taggerId: Core.Pubky;
  }): Promise<boolean> {
    try {
      const tagsData = await Core.PostTagsModel.table.get(postId);

      if (tagsData) {
        const postTagsModel = new Core.PostTagsModel(tagsData);

        const existingTag = postTagsModel.tags.find((t) => t.label === label);
        if (existingTag?.relationship) {
          Logger.debug('User already tagged this post with this label', { postId, label, taggerId });
          return false;
        }

        const added = postTagsModel.addTagger(label, taggerId);
        if (!added) {
          return false;
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
        return true;
      }

      const newPostTags = new Core.PostTagsModel({
        id: postId,
        tags: [],
      });

      const added = newPostTags.addTagger(label, taggerId);
      if (!added) {
        return false;
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
      return true;
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
   * @returns true if tag was removed, false if not found
   */
  static async remove({
    postId,
    label,
    taggerId,
  }: {
    postId: string;
    label: string;
    taggerId: Core.Pubky;
  }): Promise<boolean> {
    try {
      const tagsData = await Core.PostTagsModel.table.get(postId);

      if (!tagsData) {
        Logger.debug('Post has no tags', { postId });
        return false;
      }

      const postTagsModel = new Core.PostTagsModel(tagsData);

      const existingTag = postTagsModel.tags.find((t) => t.label === label);
      if (!existingTag?.relationship) {
        Logger.debug('User has not tagged this post with this label', { postId, label, taggerId });
        return false;
      }

      const removed = postTagsModel.removeTagger(label, taggerId);
      if (!removed) {
        return false;
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
      return true;
    } catch (error) {
      Logger.error('Error in removeTag', { error, postId, label, taggerId });
      throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, 'Failed to remove tag from post', 500, {
        error,
        postId,
        label,
        taggerId,
      });
    }
  }

  /**
   * Get all tags for a post
   * @param params - Parameters object
   * @param params.postId - ID of the post
   * @returns Array of TagModel objects
   */
  static async get({ postId }: { postId: string }): Promise<Core.TagModel[]> {
    try {
      const existingTags = await Core.PostTagsModel.table.get(postId);

      if (!existingTags) {
        return [];
      }

      const postTagsModel = new Core.PostTagsModel(existingTags);
      return postTagsModel.tags;
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.QUERY_FAILED, 'Failed to get post tags', 500, {
        error,
        postId,
      });
    }
  }
}
