import * as Core from '@/core';
import type { TCreateTagInput, TDeleteTagInput } from './tag.types';

export class Tag {
  static async create({ postId, label, taggerId, tagUrl, tagJson }: TCreateTagInput) {
    await Core.Local.Tag.save({ postId, label, taggerId });
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, tagUrl, tagJson);
  }

  static async delete({ postId, label, taggerId, tagUrl }: TDeleteTagInput) {
    await Core.Local.Tag.remove({ postId, label, taggerId });
    await Core.HomeserverService.request(Core.HomeserverAction.DELETE, tagUrl);
  }
}
