import { LocalFollowService } from './follow/follow';
import { LocalPostService } from './post/post';
import { LocalTagService } from './tag/tag';
import { LocalUserService } from './user/user';

export const Local = {
  Post: LocalPostService,
  Tag: LocalTagService,
  Follow: LocalFollowService,
  User: LocalUserService,
};

export * from './post';
export * from './tag';
export * from './follow';
export * from './user';
export * from './stream';
