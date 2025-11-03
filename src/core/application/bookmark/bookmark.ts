import * as Core from '@/core';
import { BookmarkResult } from 'pubky-app-specs';

export class BookmarkApplication {
  private constructor() {} // Prevent instantiation

  static async add(bookmark: BookmarkResult) {
    await Core.LocalBookmarkService.create(bookmark);
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, bookmark.meta.url, bookmark.bookmark.toJson());
  }

  static async delete(params: Core.TDeleteBookmarkParams) {
    await Core.LocalBookmarkService.delete(params);
    await Core.HomeserverService.request(Core.HomeserverAction.DELETE, params.postUrl);
  }
}
