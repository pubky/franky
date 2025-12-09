import * as Core from '@/core';
import * as Libs from '@/libs';

export class LocalUserTagService {
  private static readonly TAG_TABLES = [Core.UserTagsModel.table, Core.UserCountsModel.table] as const;

  static async create({ taggerId, taggedId, label }: Core.TLocalTagParams) {
    try {
      await Core.db.transaction('rw', this.TAG_TABLES, async () => {
        const userTagsModel = await Core.UserTagsModel.getOrCreate<Core.Pubky, Core.UserTagsModelSchema>(taggedId);
        const tagExists = userTagsModel.addTagger(label, taggerId);

        // Cancel the operation
        if (tagExists === null) {
          Libs.Logger.debug('User already tagged this user with this label', { taggedId, label, taggerId });
          return;
        }
        await Promise.all([
          this.saveUserTagsModel(taggedId, userTagsModel),
          Core.UserCountsModel.updateCounts({ userId: taggerId, countChanges: { tagged: 1 } }),
          Core.UserCountsModel.updateCounts({
            userId: taggedId,
            countChanges: { tags: 1, unique_tags: !tagExists ? 1 : undefined },
          }),
        ]);

        Libs.Logger.debug('User tag created', { taggedId, label, taggerId });
      });
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.UPDATE_FAILED, `Failed to create user tag`, 500, {
        error,
      });
    }
    // Update tagger user counts, tagged. DONE
    // update tagged user_tags. From there we will get the unique_tags count. DONE
    // Update tagged user counts, tags
    // Update tagged user_counts, unique_tags. For that we need to check user tags
  }

  static async delete({ taggerId, taggedId, label }: Core.TLocalTagParams) {
    try {
      await Core.db.transaction('rw', this.TAG_TABLES, async () => {
        const userTagsModel = await Core.UserTagsModel.findById(taggedId);
        if (!userTagsModel) {
          throw Libs.createDatabaseError(Libs.DatabaseErrorType.QUERY_FAILED, `User has no tags`, 404, { taggedId });
        }
        const lastTaggerOnTag = userTagsModel.removeTagger(label, taggerId);
        if (typeof lastTaggerOnTag === 'boolean') {
          await Promise.all([
            this.saveUserTagsModel(taggedId, userTagsModel),
            Core.UserCountsModel.updateCounts({ userId: taggerId, countChanges: { tagged: -1 } }),
            Core.UserCountsModel.updateCounts({
              userId: taggedId,
              countChanges: { tags: -1, unique_tags: lastTaggerOnTag ? -1 : undefined },
            }),
          ]);
          Libs.Logger.debug('User tag deleted', { taggedId, label, taggerId });
        } else {
          throw Libs.createDatabaseError(
            Libs.DatabaseErrorType.QUERY_FAILED,
            `User has not tagged this user with this label`,
            404,
            { taggedId, label, taggerId },
          );
        }
      });
    } catch (error) {
      throw Libs.createDatabaseError(Libs.DatabaseErrorType.UPDATE_FAILED, `Failed to delete user tag`, 500, {
        error,
        taggedId,
        label,
        taggerId,
      });
    }
  }

  /**
   * Saves the UserTagsModel to the database.
   *
   * @param taggedId - Unique identifier of the tagged user
   * @param userTagsModel - The UserTagsModel instance to save
   * @private
   */
  private static async saveUserTagsModel(userId: Core.Pubky, userTagsModel: Core.UserTagsModel) {
    await Core.UserTagsModel.upsert({
      id: userId,
      tags: userTagsModel.tags as Core.NexusTag[],
    });
  }

  /**
   * Find which users don't have tags persisted in cache.
   * Used to identify missing tag data that needs to be fetched.
   * @param userIds - Array of user IDs to check
   * @returns Array of user IDs that don't have tags in cache
   */
  static async getNotPersistedUserTagsInCache(userIds: Core.Pubky[]): Promise<Core.Pubky[]> {
    if (userIds.length === 0) return [];

    const existingTags = await Core.UserTagsModel.findByIdsPreserveOrder(userIds);
    return userIds.filter((_userId, index) => existingTags[index] === undefined);
  }
}
