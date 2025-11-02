import * as Core from '@/core';
import { BookmarkResult } from 'pubky-app-specs';

export class BookmarkApplication {

  private constructor() {} // Prevent instantiation

  static async add({ bookmark: { bookmark, meta }}: { bookmark: BookmarkResult }) {
    await Core.LocalBookmarkService.create({ postUrl: meta.url, bookmarkId: meta.id });
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, meta.url, bookmark.toJson());
  }

  static async delete({ postUrl }: { postUrl: string }) {
    await Core.LocalBookmarkService.delete({ postUrl });
    await Core.HomeserverService.request(Core.HomeserverAction.DELETE, postUrl);
  }
}
