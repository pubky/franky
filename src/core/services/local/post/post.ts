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
   * @param params.authorId - Unique identifier of the post author
   * @param params.postId - Unique identifier for the post
   * @param params.post - PubkyAppPost object
   *
   * @throws {DatabaseError} When database operations fail
   */
  static async create({ postId, authorId, post }: TLocalSavePostParams) {
    const compositePostId = Core.buildCompositeId({ pubky: authorId, id: postId });
    const { content, kind, parent: parentUri, attachments, embed } = post;

    const repostedUri = embed?.uri ?? null;
    const normalizedKind = Core.PostNormalizer.postKindToLowerCase(kind);

    try {
      const postDetails: Core.PostDetailsModelSchema = {
        id: compositePostId,
        content,
        indexed_at: Date.now(),
        kind: normalizedKind,
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
          Core.PostStreamModel.table,
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
          ops.push(Core.UserCountsModel.updateCounts(authorId, { posts: 1, replies: parentUri ? 1 : 0 }));

          this.updatePostStream({ postId, authorId, kind: normalizedKind, parentUri, ops, action: Core.HomeserverAction.PUT })

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

    const postCounts = await Core.PostCountsModel.findById(postId);
    if (!postCounts) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.RECORD_NOT_FOUND, 'Post counts not found', 404, { postId });
    }
    if (this.isPostLinked(postCounts)) {
      await Core.PostDetailsModel.update(postId, { content: Core.DELETED });
      // TODO: Has to return some kind of boolean to know if it has to delete the files
      return;
    }

    const postRelationships = await Core.PostRelationshipsModel.findById(postId);

    const parentUri = postRelationships?.replied ?? undefined;
    const repostedUri = postRelationships?.reposted ?? undefined;
    
    // Fetch post details and relationships to get metadata
    const postDetails = await Core.PostDetailsModel.findById(postId);
    const kind = postDetails?.kind ?? 'short';

    try {
      await Core.db.transaction(
        'rw',
        [
          Core.PostDetailsModel.table,
          Core.PostRelationshipsModel.table,
          Core.PostCountsModel.table,
          Core.PostTagsModel.table,
          Core.UserCountsModel.table,
          Core.PostStreamModel.table,
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
          ops.push(Core.UserCountsModel.updateCounts(deleterId, { posts: -1, replies: parentUri ? -1 : 0 }));

          // Extract postId from composite ID
          const { id: simplePostId } = Core.parseCompositeId(postId);

          // Remove post from streams
          this.updatePostStream({ postId: simplePostId, authorId: deleterId, kind, parentUri, ops, action: Core.HomeserverAction.DELETE });

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

  private static updatePostStream({ authorId, postId, kind, parentUri, ops, action }: Core.TLocalUpdatePostStreamParams) {
    const compositePostId = Core.buildCompositeId({ pubky: authorId, id: postId });
    
    // Select the appropriate method name based on action
    const methodName = action === Core.HomeserverAction.PUT ? 'prependPosts' : 'removePosts';
      
    if (parentUri) {
      const parentCompositeId = Core.buildCompositeIdFromPubkyUri({ uri: parentUri, domain: Core.CompositeIdDomain.POSTS });
      ops.push(Core.PostStreamModel[methodName](`author_replies:${authorId}`, [compositePostId]));
      ops.push(Core.PostStreamModel[methodName](`post_replies:${parentCompositeId}`, [compositePostId]));
    } else {
      ops.push(Core.PostStreamModel[methodName](Core.PostStreamTypes.TIMELINE_ALL_ALL, [compositePostId]));
      ops.push(Core.PostStreamModel[methodName](`timeline:all:${kind}` as Core.PostStreamTypes, [compositePostId]));
      ops.push(Core.PostStreamModel[methodName](Core.PostStreamTypes.TIMELINE_FOLLOWING_ALL, [compositePostId]));
      ops.push(Core.PostStreamModel[methodName](`timeline:following:${kind}` as Core.PostStreamTypes, [compositePostId]));
      ops.push(Core.PostStreamModel[methodName](Core.PostStreamTypes.TIMELINE_FRIENDS_ALL, [compositePostId]));
      ops.push(Core.PostStreamModel[methodName](`timeline:friends:${kind}` as Core.PostStreamTypes, [compositePostId]));
      ops.push(Core.PostStreamModel[methodName](`author:${authorId}`, [compositePostId]));
    }
  }

  private static isPostLinked(postCounts: Core.PostCountsModelSchema): boolean {
    return postCounts.replies > 0 || postCounts.reposts > 0 || postCounts.tags > 0;
  }

  /**
   * Get post counts for a specific post
   *
   * @param postId - Composite post ID (author:postId)
   * @returns Post counts or undefined if not found
   *
   * @throws {DatabaseError} When database operations fail
   */
  static async getPostCounts(postId: string): Promise<Core.PostCountsModelSchema> {
    try {
      const counts = await Core.PostCountsModel.findById(postId);
      return counts ?? ({ id: postId, tags: 0, unique_tags: 0, replies: 0, reposts: 0 } as Core.PostCountsModelSchema);
    } catch (error) {
      Libs.Logger.error('Failed to get post counts', { postId, error });
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, 'Failed to get post counts', 500, {
        error,
        postId,
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
    const postId = Core.buildCompositeIdFromPubkyUri({ uri, domain: Core.CompositeIdDomain.POSTS });
    if (!postId) return;

    const counts = await Core.PostCountsModel.findById(postId);
    if (!counts) return;

    const currentCount = counts[countField];
    const newCount = Math.max(0, currentCount + countChange);

    await Core.PostCountsModel.update(postId, { [countField]: newCount });
  }
}
