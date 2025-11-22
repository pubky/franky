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
  static async create({ tagList }: Core.TCreateTagListInput) {
    await Promise.all(
      tagList.map(async ({ taggerId, taggedId, label, tagUrl, tagJson, taggedKind }: Core.TCreateTagInput) => {
        if (taggedKind === Core.TagKind.POST) {
          await Core.LocalPostTagService.create({ taggerId, taggedId, label });
        } else {
          await Core.LocalUserTagService.create({ taggerId, taggedId, label });
        }
        await Core.HomeserverService.request(Core.HomeserverAction.PUT, tagUrl, tagJson);
      })
    );
  }

  static async delete({ taggerId, taggedId, label, tagUrl, taggedKind }: Core.TDeleteTagInput) {
    if (taggedKind === Core.TagKind.POST) {
      await Core.LocalPostTagService.delete({ taggerId, taggedId, label });
    } else {
      await Core.LocalUserTagService.delete({ taggerId, taggedId, label });
    }
    await Core.HomeserverService.request(Core.HomeserverAction.DELETE, tagUrl);
  }
}
