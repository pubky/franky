import * as Core from '@/core';

/**
 * Tag application service implementing local-first architecture.
 *
 * **Local-First Write Pattern:**
 * Both `create` and `delete` methods update the local IndexedDB first, then
 * synchronize with the homeserver. This ensures immediate UI responsiveness
 * but may cause divergence if the homeserver request fails.
 *
 * **Failure Handling:**
 * If the homeserver request fails after local update, the local state remains
 * ahead of remote state. Callers should:
 * - Implement retry logic for failed homeserver requests
 * - Add reconciliation mechanisms during app sync/bootstrap
 * - Consider compensation rollback on homeserver failure if strict consistency is required
 */
export class TagApplication {
  static async create({ postId, label, taggerId, tagUrl, tagJson }: Core.TCreateTagInput) {
    await Core.Local.Tag.create({ postId, label, taggerId });
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, tagUrl, tagJson);
  }

  static async delete({ postId, label, taggerId, tagUrl }: Core.TDeleteTagInput) {
    await Core.Local.Tag.delete({ postId, label, taggerId });
    await Core.HomeserverService.request(Core.HomeserverAction.DELETE, tagUrl);
  }
}
