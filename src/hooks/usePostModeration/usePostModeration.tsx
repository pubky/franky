'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Config from '@/config';
import { useMemo } from 'react';

export const usePostModeration = (postId: string) => {
  const postTags = useLiveQuery(() => Core.PostController.getPostTags({ compositeId: postId }), [postId]);

  const isModerated = useMemo(
    () =>
      postTags?.some((collection) =>
        collection.tags.some(
          (tag) => Config.MODERATED_TAGS.includes(tag.label) && tag.taggers.includes(Config.MODERATION_ID),
        ),
      ),
    [postTags],
  );

  const blurCensored = true;
  const unblurredByUser = false;

  const hideContent = isModerated && blurCensored && !unblurredByUser;

  return { hideContent };
};
