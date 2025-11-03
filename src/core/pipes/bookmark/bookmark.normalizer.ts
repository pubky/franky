import { BookmarkResult } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class BookmarkNormalizer {
  private constructor() {}

  static async to({ authorPubky: pubky, postUrl }: Core.TDeleteBookmarkParams): Promise<BookmarkResult> {
    const builder = Core.PubkySpecsSingleton.get(pubky);
    const bookmark = builder.createBookmark(postUrl);
    Libs.Logger.debug('Bookmark validated', { bookmark });
    return bookmark;
  }
}
