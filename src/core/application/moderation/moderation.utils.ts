import * as Core from '@/core';
import * as Config from '@/config';

const MODERATED_TAG_SET = new Set(Config.MODERATED_TAGS);

export const detectModeration = (tagCollection: Core.TagCollectionModelSchema<string> | null | undefined): boolean => {
  if (!tagCollection) return false;
  return tagCollection.tags.some(
    (tag) => MODERATED_TAG_SET.has(tag.label) && tag.taggers.includes(Config.MODERATION_ID),
  );
};

export const shouldBlur = (isModerated: boolean, isBlurred: boolean, isBlurDisabledGlobally: boolean): boolean => {
  if (isBlurDisabledGlobally) return false;
  if (!isModerated) return false;
  return isBlurred;
};
