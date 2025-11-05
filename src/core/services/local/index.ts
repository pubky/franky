import { LocalFollowService } from './follow/follow';
import { LocalPostService } from './post/post';
import { LocalProfileService } from './profile/profile';
import { LocalTagService } from './tag/tag';
import { LocalUserService } from './user/user';

export const Local = {
  Post: LocalPostService,
  Tag: LocalTagService,
  Follow: LocalFollowService,
  User: LocalUserService,
  Profile: LocalProfileService,
};

export * from './post';
export * from './tag';
export * from './follow';
export * from './user';
export * from './profile';
export * from './stream';
export * from './mute';
export * from './notification';
