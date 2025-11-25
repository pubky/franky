import { Table } from 'dexie';
import * as Libs from '@/libs';
import { PostStreamModelSchema } from './postStream.schema';
import { db } from '@/core/database';
import { PostStreamId } from './postStream.types';
import { BaseStreamModel } from '@/core/models/shared/stream/stream';

export class PostStreamModel extends BaseStreamModel<PostStreamId, string, PostStreamModelSchema> {
  static table: Table<PostStreamModelSchema> = db.table('post_streams');

  name: string | undefined;

  constructor(stream: PostStreamModelSchema) {
    super(stream);
    this.name = stream.name;
  }

  // TODO: What is it that one?? since when the streams has a name?
  // Custom upsert method to handle name property
  static async createWithName(id: PostStreamId, stream: string[], name: string): Promise<PostStreamModelSchema> {
    try {
      const streamData = { id, name, stream } as PostStreamModelSchema;
      await PostStreamModel.table.put(streamData);

      Libs.Logger.debug('Post Stream row upserted successfully', { streamId: id, name, stream });
      return streamData;
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.UPSERT_FAILED,
        `Failed to upsert PostStream with ID: ${String(id)}`,
        500,
        { error, streamId: id, name, streamLength: stream?.length ?? 0 },
      );
    }
  }

  /**
   * Adds post IDs to the head of the stream array in the database (atomic operation)
   * Creates the stream if it doesn't exist, filters out duplicates before adding
   *
   * @param id - The stream ID to update
   * @param postIds - Array of post IDs to add to the head of the stream
   * @returns Promise that resolves when the operation completes
   * @throws {DatabaseError} When the update fails
   *
   * @example
   * ```typescript
   * await PostStreamModel.prependPosts('home-feed', ['author:postId1', 'author:postId2']);
   * ```
   */
  static async prependPosts(id: PostStreamId, postIds: string[]): Promise<void> {
    try {
      // Check if stream exists
      const existingStream = await PostStreamModel.table.get(id);

      if (existingStream) {
        // Update existing stream
        await PostStreamModel.table
          .where('id')
          .equals(id)
          .modify((stream) => {
            // Filter out posts that already exist in the stream
            const newPosts = postIds.filter((postId) => !stream.stream.includes(postId));

            if (newPosts.length > 0) {
              // Add new posts to the beginning of the stream
              stream.stream.unshift(...newPosts);
            }
          });
      } else {
        // Create new stream with the posts
        await PostStreamModel.upsert(id, postIds);
      }

      Libs.Logger.debug('Posts prepended to stream successfully', {
        streamId: id,
        postsAdded: postIds.length,
      });
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.UPDATE_FAILED,
        `Failed to prepend posts to stream with ID: ${String(id)}`,
        500,
        { error, streamId: id, postIdsCount: postIds.length },
      );
    }
  }

  /**
   * Removes post IDs from the stream array in the database (atomic operation)
   * Silently succeeds if stream doesn't exist
   *
   * @param id - The stream ID to update
   * @param postIds - Array of post IDs to remove from the stream
   * @returns Promise that resolves when the operation completes
   * @throws {DatabaseError} When the update fails
   *
   * @example
   * ```typescript
   * await PostStreamModel.removePosts('home-feed', ['author:postId1', 'author:postId2']);
   * ```
   */
  static async removePosts(id: PostStreamId, postIds: string[]): Promise<void> {
    try {
      // Check if stream exists
      const existingStream = await PostStreamModel.table.get(id);

      if (existingStream) {
        // Only modify if stream exists
        await PostStreamModel.table
          .where('id')
          .equals(id)
          .modify((stream) => {
            // Filter out the posts that need to be removed
            stream.stream = stream.stream.filter((postId) => !postIds.includes(postId));
          });

        Libs.Logger.debug('Posts removed from stream successfully', {
          streamId: id,
          postsRemoved: postIds.length,
        });
      } else {
        // Stream doesn't exist, nothing to remove - silently succeed
        Libs.Logger.debug('Stream does not exist, skipping removal', {
          streamId: id,
          postsToRemove: postIds.length,
        });
      }
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.UPDATE_FAILED,
        `Failed to remove posts from stream with ID: ${String(id)}`,
        500,
        { error, streamId: id, postIdsCount: postIds.length },
      );
    }
  }

  /**
   * Removes a single post ID from the stream array in the database (atomic operation)
   *
   * @param id - The stream ID to update
   * @param postId - Post ID to remove from the stream
   * @returns Promise that resolves when the operation completes
   * @throws {DatabaseError} When the update fails
   *
   * @example
   * ```typescript
   * await PostStreamModel.removePost('home-feed', 'author:postId1');
   * ```
   */
  static async removePost(id: PostStreamId, postId: string): Promise<void> {
    return PostStreamModel.removePosts(id, [postId]);
  }

  // Instance methods
  addPosts(postIds: string[]): void {
    // Filter out posts that already exist and add new ones to beginning
    const newPosts = postIds.filter((postId) => !this.stream.includes(postId));
    this.stream.unshift(...newPosts); // Add to beginning for chronological order
  }
}
