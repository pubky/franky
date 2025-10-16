import * as Core from '@/core';

/**
 * Updates the tagger's tagged user counts.
 *
 * @param taggerId - Unique identifier of the user
 * @param direction - Direction of the count update (INCREMENT or DECREMENT)
 * @private
 */
export async function updateTaggerCount(
  taggerId: Core.Pubky,
  direction: typeof Core.INCREMENT | typeof Core.DECREMENT,
): Promise<void> {
  const tagger = await Core.UserCountsModel.findById(taggerId);
  if (tagger) {
    tagger.updateCount(Core.UserCountsFields.TAGGED, direction);
    await Core.UserCountsModel.update(taggerId, { [Core.UserCountsFields.TAGGED]: tagger.tagged });
  }
}
