import { BookmarkResult } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class BookmarkNormalizer {
  private constructor() {}

  static async to({pubky, postUrl}: {pubky: Core.Pubky, postUrl: string}): Promise<BookmarkResult> {
    const builder = Core.PubkySpecsSingleton.get(pubky);
    const bookmark = builder.createBookmark(postUrl);
    Libs.Logger.debug('Bookmark validated', { bookmark });
    return bookmark;
  }
}
