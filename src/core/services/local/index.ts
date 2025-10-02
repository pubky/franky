import { LocalPostService } from './post';
import { LocalTagService } from './tag';

export const Local = {
  Post: LocalPostService,
  Tag: LocalTagService,
};

export * from './post.types';
export * from './tag.types';
