import * as Core from '@/core';
import * as Libs from '@/libs';
import { postUriBuilder } from 'pubky-app-specs';

export class LocalPostService {
  private constructor() {}

  /**
   * Read a post from the local database.
   * @param postId - ID of the post to read
   * @returns Post details
   */
  static async read({ postId }: { postId: string }) {
    try {
      return await Core.PostDetailsModel.findById(postId);
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, 'Failed to read post', 500, {
        error,
        postId,
      });
    }
  }

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
  static async create({ compositePostId, post }: Core.TLocalSavePostParams) {
    const { content, kind, parent: parentUri, attachments, embed } = post;

    const repostedUri = embed?.uri ?? null;
    const normalizedKind = Core.PostNormalizer.postKindToLowerCase(kind);

    const { pubky: authorId, id: postId } = Core.parseCompositeId(compositePostId);

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

          this.updatePostStream({
            compositePostId,
            kind: normalizedKind,
            parentUri,
            ops,
            action: Core.HomeserverAction.PUT,
          });

          await Promise.all(ops);
        },
      );

      Libs.Logger.debug('Post saved successfully', { compositePostId, kind, parentUri, repostedUri });
    } catch (error) {
      Libs.Logger.error('Failed to save post', { compositePostId });
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.SAVE_FAILED, 'Failed to save post', 500, {
        error,
        compositePostId,
        content,
        kind,
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
   *
   * @returns true if the post had connections like replies or reposts or tags, false otherwise
   */
  static async delete({ compositePostId }: Core.TDeletePostParams): Promise<boolean> {
    const { pubky: authorId } = Core.parseCompositeId(compositePostId);

    const postCounts = await Core.PostCountsModel.findById(compositePostId);
    if (!postCounts) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.RECORD_NOT_FOUND, 'Post counts not found', 404, {
        compositePostId,
      });
    }
    if (this.isPostLinked(postCounts)) {
      await Core.PostDetailsModel.update(compositePostId, { content: Core.DELETED });
      return true;
    }

    const postRelationships = await Core.PostRelationshipsModel.findById(compositePostId);

    const parentUri = postRelationships?.replied ?? undefined;
    const repostedUri = postRelationships?.reposted ?? undefined;

    // Fetch post details and relationships to get metadata
    const postDetails = await Core.PostDetailsModel.findById(compositePostId);
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
            Core.PostDetailsModel.deleteById(compositePostId),
            Core.PostRelationshipsModel.deleteById(compositePostId),
            Core.PostCountsModel.deleteById(compositePostId),
            Core.PostTagsModel.deleteById(compositePostId),
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
          ops.push(Core.UserCountsModel.updateCounts(authorId, { posts: -1, replies: parentUri ? -1 : 0 }));

          // Remove post from streams
          this.updatePostStream({ compositePostId, kind, parentUri, ops, action: Core.HomeserverAction.DELETE });

          await Promise.all(ops);
        },
      );

      Libs.Logger.debug('Post deleted successfully', { compositePostId });
      return false;
    } catch (error) {
      Libs.Logger.error('Failed to delete post', { compositePostId });
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.DELETE_FAILED, 'Failed to delete post', 500, {
        error,
        compositePostId,
      });
    }
  }

  private static updatePostStream({
    compositePostId,
    kind,
    parentUri,
    ops,
    action,
  }: Core.TLocalUpdatePostStreamParams) {
    const { pubky: authorId } = Core.parseCompositeId(compositePostId);

    // Select the appropriate method name based on action
    const methodName = action === Core.HomeserverAction.PUT ? 'prependPosts' : 'removePosts';

    if (parentUri) {
      const parentCompositeId = Core.buildCompositeIdFromPubkyUri({
        uri: parentUri,
        domain: Core.CompositeIdDomain.POSTS,
      });
      ops.push(Core.PostStreamModel[methodName](`author_replies:${authorId}`, [compositePostId]));
      ops.push(Core.PostStreamModel[methodName](`post_replies:${parentCompositeId}`, [compositePostId]));
    } else {
      ops.push(Core.PostStreamModel[methodName](Core.PostStreamTypes.TIMELINE_ALL_ALL, [compositePostId]));
      ops.push(Core.PostStreamModel[methodName](`timeline:all:${kind}` as Core.PostStreamTypes, [compositePostId]));
      ops.push(Core.PostStreamModel[methodName](Core.PostStreamTypes.TIMELINE_FOLLOWING_ALL, [compositePostId]));
      ops.push(
        Core.PostStreamModel[methodName](`timeline:following:${kind}` as Core.PostStreamTypes, [compositePostId]),
      );
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

  static async getPostTags(postId: string): Promise<Core.TagCollectionModelSchema<string>[]> {
    try {
      const tags = await Core.PostTagsModel.findById(postId);
      if (!tags) return [];

      return [tags] as unknown as Core.TagCollectionModelSchema<string>[];
    } catch (error) {
      Libs.Logger.error('Failed to get post tags', { postId, error });
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, 'Failed to get post tags', 500, {
        error,
        postId,
      });
    }
  }

  /**
   * Persists complete post data from Nexus to local database
   *
   * @param params.postId - Composite post ID (author:postId)
   * @param params.postData - Complete post data from Nexus
   *
   * @throws {DatabaseError} When database operations fail
   */
  static async persistPostData({ postId, postData }: { postId: string; postData: Core.NexusPost }): Promise<void> {
    try {
      Libs.Logger.debug(`[LocalPostService] Starting persist for post ${postId}`);
      Libs.Logger.debug(`[LocalPostService] postData.details:`, postData.details);
      Libs.Logger.debug(`[LocalPostService] postData.counts:`, postData.counts);
      Libs.Logger.debug(`[LocalPostService] postData.details.id: ${postData.details.id}`);
      Libs.Logger.debug(`[LocalPostService] Match: ${postData.details.id === postId}`);

      await Core.db.transaction(
        'rw',
        [
          Core.PostDetailsModel.table,
          Core.PostCountsModel.table,
          Core.PostRelationshipsModel.table,
          Core.PostTagsModel.table,
        ],
        async () => {
          // Persist post details (remove 'author' field and ensure correct composite ID)
          Libs.Logger.debug(`[LocalPostService] Upserting post details for ${postId}`);
          Libs.Logger.debug(`[LocalPostService] Post details from Nexus:`, postData.details);

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { author, ...postDetailsWithoutAuthor } = postData.details;
          const postDetailsToUpsert = {
            ...postDetailsWithoutAuthor,
            id: postId, // Use the composite ID (author:postId)
          };

          Libs.Logger.debug(`[LocalPostService] Post details to upsert:`, postDetailsToUpsert);
          await Core.PostDetailsModel.upsert(postDetailsToUpsert);
          Libs.Logger.debug(`[LocalPostService] Post details upserted successfully with id:`, postId);

          // Persist post counts
          await Core.PostCountsModel.upsert({
            id: postId,
            ...postData.counts,
          });

          // Persist post relationships
          await Core.PostRelationshipsModel.upsert({
            id: postId,
            ...postData.relationships,
          });

          // Persist post tags if any
          if (postData.tags && postData.tags.length > 0) {
            await Core.PostTagsModel.upsert({
              id: postId,
              tags: postData.tags,
            });
          }
        },
      );

      Libs.Logger.debug(`[LocalPostService] Post ${postId} with complete data persisted locally`);
    } catch (error) {
      Libs.Logger.error('Failed to persist post data', { postId, error });
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.SAVE_FAILED, 'Failed to persist post data', 500, {
        error,
        postId,
      });
    }
  }
}
