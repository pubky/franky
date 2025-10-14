import * as Core from '@/core';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';

export class LocalMuteService {
  static async create({ muter, mutee }: Core.TMuteParams) {
    try {
      await Core.db.transaction('rw', [Core.UserRelationshipsModel.table], async () => {
        const rel = await Core.UserRelationshipsModel.findById(mutee);

        if (rel) {
          if (rel.muted === true) return;
          await Core.UserRelationshipsModel.update(mutee, { muted: true });
          return;
        }

        await Core.UserRelationshipsModel.create({
          id: mutee,
          following: false,
          followed_by: false,
          muted: true,
        });
      });

      Logger.debug('Mute created successfully', { muter, mutee });
    } catch (error) {
      Logger.error('Failed to mute a user', { muter, mutee, error });
      throw createDatabaseError(DatabaseErrorType.SAVE_FAILED, 'Failed to create mute relationship', 500, {
        error,
      });
    }
  }

  static async delete({ muter, mutee }: Core.TMuteParams) {
    try {
      await Core.db.transaction('rw', [Core.UserRelationshipsModel.table], async () => {
        const rel = await Core.UserRelationshipsModel.findById(mutee);

        if (rel) {
          if (rel.muted === false) return;
          await Core.UserRelationshipsModel.update(mutee, { muted: false });
          return;
        }

        await Core.UserRelationshipsModel.create({
          id: mutee,
          following: false,
          followed_by: false,
          muted: false,
        });
      });

      Logger.debug('Unmute completed successfully', { muter, mutee });
    } catch (error) {
      Logger.error('Failed to unmute a user', { muter, mutee, error });
      throw createDatabaseError(DatabaseErrorType.DELETE_FAILED, 'Failed to delete mute relationship', 500, {
        error,
      });
    }
  }
}
