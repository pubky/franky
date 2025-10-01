import { LocalDbPostService } from './post';
import { LocalDbTagService } from './tag';

export const LocalDb = {
  Post: LocalDbPostService,
  Tag: LocalDbTagService,
};
