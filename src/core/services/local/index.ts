import { LocalFollowService } from './follow/follow';
import { LocalPostService } from './post/post';
import { LocalTagService } from './tag/tag';
import { LocalPersistenceService } from './persistence/persistence';
import { LocalStreamService } from './stream/stream';

export const Local = {
  Post: LocalPostService,
  Tag: LocalTagService,
  Follow: LocalFollowService,
  Persistence: LocalPersistenceService,
  Stream: LocalStreamService,
};

export * from './post';
export * from './tag';
export * from './follow';
export * from './persistence';
export * from './stream';
