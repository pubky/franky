import { LocalPostService } from './post/post';
import { LocalTagService } from './tag/tag';

export const Local = {
  Post: LocalPostService,
  Tag: LocalTagService,
};

export * from './post';
export * from './tag';
