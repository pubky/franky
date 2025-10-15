import * as Core from '@/core';
import * as Libs from '@/libs';
import type { TLocalSavePostParams } from './post.types';
import { postUriBuilder } from 'pubky-app-specs';

export class LocalPostService {
  /**
   * Save a new post to the local database.
   *
   * Creates a new post with all its related records:
   * - Post details (content, kind, URI, etc.)
   * - Post counts (initialized to zero)
   * - Post relationships (parent URI if reply)
   * - Post tags (empty array)
   *
   * If the post is a reply, also updates the parent post's reply count.
   *
   * @param params.postId - Unique identifier for the post (format: "authorId:postId")
   * @param params.content - Post content
   * @param params.kind - Post kind ('short' or 'long')
   * @param params.authorId - Unique identifier of the post author
   * @param params.parentUri - URI of parent post if this is a reply
   * @param params.attachments - Optional array of attachment objects
   *
   * @throws {DatabaseError} When database operations fail
   */
  static async create({ postId, authorId, post }: TLocalSavePostParams) {
    const compositePostId = Core.buildPostCompositeId({ pubky: authorId, postId });
    const { content, kind, parent: parentUri, attachments, embed } = post;

    const repostedUri = embed?.uri ?? null;

    try {
      const postDetails: Core.PostDetailsModelSchema = {
        id: compositePostId,
        content,
        indexed_at: Date.now(),
        kind: Core.PostNormalizer.postKindToLowerCase(kind),
        uri: postUriBuilder(authorId, postId),
        attachments: attachments ?? null,
      };

      const postRelationships: Core.PostRelationshipsModelSchema = {
        id: compositePostId,
        replied: parentUri ?? null,
        reposted: repostedUri,
        mentioned: [],
      };

      const postCounts: Core.PostCountsModelSchema = {
        id: compositePostId,
        tags: 0,
        unique_tags: 0,
        replies: 0,
        reposts: 0,
      };

      await Core.db.transaction(
        'rw',
        [
          Core.PostDetailsModel.table,
          Core.PostRelationshipsModel.table,
          Core.PostCountsModel.table,
          Core.PostTagsModel.table,
          Core.UserCountsModel.table,
        ],
        async () => {
          await Promise.all([
            Core.PostDetailsModel.create(postDetails),
            Core.PostRelationshipsModel.create(postRelationships),
            Core.PostCountsModel.create(postCounts),
            Core.PostTagsModel.create({ id: compositePostId, tags: [] }),
          ]);

          const ops: Promise<unknown>[] = [];

          // Update related post counts
          if (parentUri) {
            ops.push(this.updatePostCount(parentUri, 'replies', 1));
          }
          if (repostedUri) {
            ops.push(this.updatePostCount(repostedUri, 'reposts', 1));
          }

          // Update author's user counts in a single operation
          ops.push(this.updateUserCounts(authorId, { posts: 1, replies: parentUri ? 1 : 0 }));

          await Promise.all(ops);
        },
      );

      Libs.Logger.debug('Post saved successfully', { postId, kind, parentUri, repostedUri });
    } catch (error) {
      Libs.Logger.error('Failed to save post', { postId, authorId });
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.SAVE_FAILED, 'Failed to save post', 500, {
        error,
        postId,
        content,
        kind,
        authorId,
      });
    }
  }

  /**
   * Delete a post from the local database.
   *
   * Removes the post and all related records. If the post is a reply,
   * decrements the parent post's reply count. If the post is a repost,
   * decrements the original post's repost count.
   *
   * @param params.postId - Unique identifier for the post to delete
   * @param params.userId - Unique identifier of the user deleting the post
   * @param params.parentUri - URI of parent post if this is a reply
   * @param params.repostedUri - URI of original post if this is a repost
   *
   * @throws {DatabaseError} When database operations fail
   */
  static async delete({ postId, deleterId }: Core.TDeletePostParams) {
    const postRelationships = await Core.PostRelationshipsModel.findById(postId);

    const parentUri = postRelationships?.replied ?? undefined;
    const repostedUri = postRelationships?.reposted ?? undefined;

    try {
      await Core.db.transaction(
        'rw',
        [
          Core.PostDetailsModel.table,
          Core.PostRelationshipsModel.table,
          Core.PostCountsModel.table,
          Core.PostTagsModel.table,
          Core.UserCountsModel.table,
        ],
        async () => {
          await Promise.all([
            Core.PostDetailsModel.deleteById(postId),
            Core.PostRelationshipsModel.deleteById(postId),
            Core.PostCountsModel.deleteById(postId),
            Core.PostTagsModel.deleteById(postId),
          ]);

          const ops: Promise<unknown>[] = [];

          // Decrement related post counts
          if (parentUri) {
            ops.push(this.updatePostCount(parentUri, 'replies', -1));
          }
          if (repostedUri) {
            ops.push(this.updatePostCount(repostedUri, 'reposts', -1));
          }

          // Update author's user counts in a single operation
          ops.push(this.updateUserCounts(deleterId, { posts: -1, replies: parentUri ? -1 : 0 }));

          await Promise.all(ops);
        },
      );

      Libs.Logger.debug('Post deleted successfully', { postId, deleterId });
    } catch (error) {
      Libs.Logger.error('Failed to delete post', { postId, deleterId });
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.DELETE_FAILED, 'Failed to delete post', 500, {
        error,
        postId,
        deleterId,
      });
    }
  }

  /**
   * Helper method to update post counts safely
   */
  private static async updatePostCount(
    uri: string,
    countField: 'replies' | 'reposts',
    countChange: number,
  ): Promise<void> {
    const postId = Core.buildPostIdFromPubkyUri(uri);
    if (!postId) return;

    const counts = await Core.PostCountsModel.findById(postId);
    if (!counts) return;

    const currentCount = counts[countField];
    const newCount = Math.max(0, currentCount + countChange);

    await Core.PostCountsModel.update(postId, { [countField]: newCount });
  }

  /**
   * Helper method to update multiple user counts in a single operation
   */
  private static async updateUserCounts(
    userId: Core.Pubky,
    countChanges: { posts?: number; replies?: number },
  ): Promise<void> {
    const userCounts = await Core.UserCountsModel.findById(userId);
    if (!userCounts) return;

    const updates: Partial<Core.UserCountsModelSchema> = {};

    if (countChanges.posts !== undefined) {
      updates.posts = Math.max(0, userCounts.posts + countChanges.posts);
    }
    if (countChanges.replies !== undefined && countChanges.replies !== 0) {
      updates.replies = Math.max(0, userCounts.replies + countChanges.replies);
    }

    if (Object.keys(updates).length > 0) {
      await Core.UserCountsModel.update(userId, updates);
    }
  }
}
