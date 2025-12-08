import * as Core from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';
import { muteEvents } from './mute.events';

type MuteAction = 'mute' | 'unmute';

export class LocalMuteService {
  private static readonly DEFAULT_RELATIONSHIP = {
    following: false,
    followed_by: false,
  } as const;

  /**
   * Creates a mute relationship between users
   */
  static async create({ muter, mutee }: Core.TMuteParams): Promise<void> {
    return LocalMuteService.updateMuteStatus({ muter, mutee }, 'mute');
  }

  /**
   * Removes a mute relationship between users
   */
  static async delete({ muter, mutee }: Core.TMuteParams): Promise<void> {
    return LocalMuteService.updateMuteStatus({ muter, mutee }, 'unmute');
  }

  /**
   * Updates the mute status for a user relationship
   * @private
   */
  private static async updateMuteStatus({ muter, mutee }: Core.TMuteParams, action: MuteAction): Promise<void> {
    const isMuting = action === 'mute';
    const config = {
      mute: {
        targetStatus: true,
        successMessage: 'Mute created successfully',
        errorMessage: 'Failed to mute a user',
        databaseErrorMessage: 'Failed to create mute relationship',
        errorType: DatabaseErrorType.SAVE_FAILED,
      },
      unmute: {
        targetStatus: false,
        successMessage: 'Unmute completed successfully',
        errorMessage: 'Failed to unmute a user',
        databaseErrorMessage: 'Failed to delete mute relationship',
        errorType: DatabaseErrorType.DELETE_FAILED,
      },
    };

    const { targetStatus, successMessage, errorMessage, databaseErrorMessage, errorType } = config[action];

    try {
      let statusChanged = false;

      await Core.db.transaction('rw', [Core.UserRelationshipsModel.table], async () => {
        const existingRelationship = await Core.UserRelationshipsModel.findById(mutee);

        if (existingRelationship) {
          // If the relationship already has the desired mute status, no action needed
          if (existingRelationship.muted === targetStatus) {
            return;
          }

          // Update the existing relationship
          await Core.UserRelationshipsModel.update(mutee, { muted: targetStatus });
          statusChanged = true;
          return;
        }

        // Create a new relationship with the desired mute status
        await Core.UserRelationshipsModel.create({
          id: mutee,
          ...this.DEFAULT_RELATIONSHIP,
          muted: targetStatus,
        });
        statusChanged = true;
      });

      // Update muted stream if status changed (outside transaction)
      if (statusChanged) {
        await this.updateUserStreams(muter, mutee, isMuting);

        // Remove posts from cached streams and emit event when muting
        if (isMuting) {
          await this.removePostsFromCachedStreams(mutee);
          muteEvents.emitMute(mutee);
        } else {
          // On unmute, just emit event - posts will appear on next fetch
          muteEvents.emitUnmute(mutee);
        }
      }

      Logger.debug(successMessage, { muter, mutee });
    } catch (error) {
      Logger.error(errorMessage, { muter, mutee, error });
      throw createDatabaseError(errorType, databaseErrorMessage, 500, { error });
    }
  }

  /**
   * Update user streams after mute/unmute
   *
   * @param muter - User performing the mute action
   * @param mutee - User being muted/unmuted
   * @param isMuting - True for mute, false for unmute
   */
  private static async updateUserStreams(muter: Core.Pubky, mutee: Core.Pubky, isMuting: boolean): Promise<void> {
    const streamOp = isMuting
      ? Core.LocalStreamUsersService.prependToStream
      : Core.LocalStreamUsersService.removeFromStream;

    const mutedStreamId = Core.buildUserCompositeId({ userId: muter, reach: Core.UserStreamSource.MUTED });
    await streamOp.call(Core.LocalStreamUsersService, mutedStreamId, [mutee]);
  }

  /**
   * Remove all posts from a muted user from cached post streams and queues.
   * Posts are identified as composite IDs in format "authorPubky:postId".
   *
   * @param mutedUserId - The user whose posts should be removed
   */
  private static async removePostsFromCachedStreams(mutedUserId: Core.Pubky): Promise<void> {
    try {
      // Remove from post_streams table
      const allPostStreams = await Core.PostStreamModel.table.toArray();
      for (const stream of allPostStreams) {
        const postsToRemove = stream.stream.filter((postId) => {
          const { pubky: authorId } = Core.parseCompositeId(postId);
          return authorId === mutedUserId;
        });

        if (postsToRemove.length > 0) {
          await Core.PostStreamModel.removeItems(stream.id, postsToRemove);
          Logger.debug('Removed muted user posts from stream', {
            streamId: stream.id,
            removedCount: postsToRemove.length,
            mutedUserId,
          });
        }
      }

      // Remove from post_stream_queues table
      const allQueues = await Core.PostStreamQueueModel.table.toArray();
      for (const queue of allQueues) {
        const filteredQueue = queue.queue.filter((postId) => {
          const { pubky: authorId } = Core.parseCompositeId(postId);
          return authorId !== mutedUserId;
        });

        if (filteredQueue.length !== queue.queue.length) {
          await Core.PostStreamQueueModel.upsert({
            id: queue.id,
            queue: filteredQueue,
            streamTail: queue.streamTail,
          });
          Logger.debug('Removed muted user posts from queue', {
            queueId: queue.id,
            originalCount: queue.queue.length,
            newCount: filteredQueue.length,
            mutedUserId,
          });
        }
      }

      Logger.debug('Completed removing muted user posts from all cached streams', { mutedUserId });
    } catch (error) {
      // Log but don't throw - mute operation should still succeed even if cache cleanup fails
      Logger.error('Failed to remove muted user posts from cached streams', { mutedUserId, error });
    }
  }
}
