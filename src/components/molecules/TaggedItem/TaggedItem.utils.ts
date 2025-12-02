import * as Core from '@/core';
import type { TagWithAvatars } from './TaggedItem.types';

/**
 * Transform NexusTag to TagWithAvatars by resolving avatar URLs
 */
export function transformTagWithAvatars(tag: Core.NexusTag): TagWithAvatars {
  return {
    label: tag.label,
    taggers_count: tag.taggers_count,
    relationship: tag.relationship,
    taggers: tag.taggers.map((taggerId) => ({
      id: taggerId,
      avatarUrl: Core.FileController.getAvatarUrl(taggerId as Core.Pubky),
    })),
  };
}
