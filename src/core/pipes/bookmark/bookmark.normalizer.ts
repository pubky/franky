import { BookmarkResult } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class BookmarkNormalizer {
  private constructor() {}

  static to(postUri: string, userId: Core.Pubky): BookmarkResult {
    const builder = Core.PubkySpecsSingleton.get(userId);
    const result = builder.createBookmark(postUri);
    Libs.Logger.debug('Bookmark validated', { result });
    return result;
  }
}
