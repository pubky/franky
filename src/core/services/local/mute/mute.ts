import * as Core from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';

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
}
