import * as Core from '@/core';
import type { TCreateTagInput, TDeleteTagInput } from './tag.types';

async function create({ postId, label, taggerId, tagUrl, tagJson }: TCreateTagInput) {
  await Core.Local.Tag.save({ postId, label, taggerId });
  await Core.HomeserverService.put(tagUrl, tagJson);
}

async function deleteTag({ postId, label, taggerId, tagUrl }: TDeleteTagInput) {
  await Core.Local.Tag.remove({ postId, label, taggerId });
  await Core.HomeserverService.delete(tagUrl);
}

export const Tag = {
  create,
  delete: deleteTag,
};
