import * as Core from '@/core';

export class BookmarkController {
  private constructor() {} // Prevent instantiation

  static async add({ postUrl }: { postUrl: string}) {
    const pubky = Core.useAuthStore.getState().selectCurrentUserPubky();
    const bookmark = await Core.BookmarkNormalizer.to({pubky, postUrl});
    await Core.BookmarkApplication.add({ bookmark });
  }

  static async delete({ postUrl }: { postUrl: string}) {
    await Core.BookmarkApplication.delete({ postUrl });
  }

  static async fetch() {
    // 1. Check if the one that we have in the cache is the latest one:
    //      1.1. Query indexdb, get the latest one and query nexus
    //      1.2. Meanwhile, render the ones that are in the cache
    // 2. When we hit the last bookmark, query nexus
  }
}
