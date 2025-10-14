import * as Core from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';
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
  static async create({ postId, content, kind, authorId, parentUri, attachments }: TLocalSavePostParams) {
    const { postId: postIdPart } = Core.parsePostCompositeId(postId);
    try {
      const postDetails: Core.PostDetailsModelSchema = {
        id: postId,
        content,
        indexed_at: Date.now(),
        kind,
        uri: postUriBuilder(authorId, postIdPart),
        attachments: attachments ?? null,
      };

      const postRelationships: Core.PostRelationshipsModelSchema = {
        id: postId,
        replied: parentUri ?? null,
        reposted: null,
        mentioned: [],
      };

      const postCounts: Core.PostCountsModelSchema = {
        id: postId,
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
        ],
        async () => {
          await Promise.all([
            Core.PostDetailsModel.create(postDetails),
            Core.PostRelationshipsModel.create(postRelationships),
            Core.PostCountsModel.create(postCounts),
            Core.PostTagsModel.create({ id: postId, tags: [] }),
          ]);

          if (parentUri) {
            const fullParentId = Core.buildPostIdFromPubkyUri(parentUri);
            if (fullParentId) {
              const parentCounts = await Core.PostCountsModel.findById(fullParentId);
              if (parentCounts) {
                await Core.PostCountsModel.update(parentCounts.id, { replies: parentCounts.replies + 1 });
              }
            }
          }
        },
      );

      Logger.debug('Post saved successfully', { postId, kind, parentUri });
    } catch (error) {
      Logger.error('Failed to save post', { postId, authorId });
      throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, 'Failed to save post', 500, {
        error,
        postId,
        content,
        kind,
        authorId,
      });
    }
  }
}
