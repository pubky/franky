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

  static async mute({ eventType, muteUrl, muteJson, muter, mutee }: Core.TUserApplicationMuteParams) {
    if (eventType === Core.HomeserverAction.PUT) {
      await Core.LocalMuteService.create({ muter, mutee });
      await Core.HomeserverService.request(eventType, muteUrl, muteJson);
      return;
    }

    if (eventType === Core.HomeserverAction.DELETE) {
      await Core.LocalMuteService.delete({ muter, mutee });
      await Core.HomeserverService.request(eventType, muteUrl, muteJson);
      return;
    }
  }
}
