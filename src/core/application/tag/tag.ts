import * as Core from '@/core';
import type { TCreateTagInput, TDeleteTagInput } from './tag.types';

async function create({ postId, label, taggerId, tagUrl, tagJson }: TCreateTagInput) {
  await Core.Local.Tag.save({ postId, label, taggerId });
  await Core.HomeserverService.request(Core.HomeserverAction.PUT, tagUrl, tagJson);
}

async function deleteTag({ postId, label, taggerId, tagUrl }: TDeleteTagInput) {
  await Core.Local.Tag.remove({ postId, label, taggerId });
  await Core.HomeserverService.request(Core.HomeserverAction.DELETE, tagUrl);
}

export const Tag = {
  create,
  delete: deleteTag,
};
