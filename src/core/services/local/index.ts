import { LocalFollowService } from './follow/follow';
import { LocalPostService } from './post/post';
import { LocalTagService } from './tag/tag';

export const Local = {
  Post: LocalPostService,
  Tag: LocalTagService,
  Follow: LocalFollowService,
};

export * from './post';
export * from './tag';
export * from './follow';
