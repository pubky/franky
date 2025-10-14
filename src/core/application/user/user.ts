import * as Core from '@/core';

export class UserApplication {
  static async follow({ eventType, followUrl, followJson, follower, followee }: Core.TUserApplicationFollowParams) {
    if (eventType === Core.HomeserverAction.PUT) {
      await Core.LocalFollowService.create({ follower, followee });
    } else if (eventType === Core.HomeserverAction.DELETE) {
      await Core.LocalFollowService.delete({ follower, followee });
    }
    await Core.HomeserverService.request(eventType, followUrl, followJson);
  }

  static async mute({ eventType, muteUrl, muteJson, mutee }: Core.TUserApplicationMuteParams) {
    await Core.db.transaction('rw', [Core.UserRelationshipsModel.table], async () => {
      const rel = await Core.UserRelationshipsModel.findById(mutee);
      const shouldMute = eventType === Core.HomeserverAction.PUT;

      if (rel) {
        if (rel.muted === shouldMute) return;
        await Core.UserRelationshipsModel.update(mutee, { muted: shouldMute });
        return;
      }

      await Core.UserRelationshipsModel.create({
        id: mutee,
        following: false,
        followed_by: false,
        muted: shouldMute,
      });
    });

    await Core.HomeserverService.request(eventType, muteUrl, muteJson);
  }
}
