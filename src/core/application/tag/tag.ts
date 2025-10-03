import * as Core from '@/core';
import type { TCreateTagInput, TCreateTagOutput, TDeleteTagInput, TDeleteTagOutput } from './tag.types';

async function create({ postId, label, taggerId, tagUrl, tagJson }: TCreateTagInput): Promise<TCreateTagOutput> {
  await Core.Local.Tag.save({ postId, label, taggerId });

  const onboardingStore = Core.useOnboardingStore.getState();
  const secretKey = onboardingStore.secretKey || '';
  const homeserver = Core.HomeserverService.getInstance(secretKey);

  const response = await homeserver.fetch(tagUrl, {
    method: 'PUT',
    body: JSON.stringify(tagJson),
  });

  if (!response.ok) {
    throw new Error(`Failed to create tag: ${response.statusText}`);
  }

  return { success: true };
}

async function deleteTag({ postId, label, taggerId, tagUrl }: TDeleteTagInput): Promise<TDeleteTagOutput> {
  await Core.Local.Tag.remove({ postId, label, taggerId });

  const onboardingStore = Core.useOnboardingStore.getState();
  const secretKey = onboardingStore.secretKey || '';
  const homeserver = Core.HomeserverService.getInstance(secretKey);

  const response = await homeserver.fetch(tagUrl, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete tag: ${response.statusText}`);
  }

  return { success: true };
}

export const Tag = {
  create,
  delete: deleteTag,
};
