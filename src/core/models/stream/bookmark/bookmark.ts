import { Table } from 'dexie';
import * as Core from '@/core';
import { RecordModelBase } from '@/core/models/shared/base/record/baseRecord';

export class BookmarkModel
  extends RecordModelBase<string, Core.BookmarkModelSchema>
  implements Core.BookmarkModelSchema
{
  static table: Table<Core.BookmarkModelSchema> = Core.db.table('bookmarks');

  userId: Core.Pubky;
  postId: string;
  created_at: number;
  updated_at: number;

  constructor(bookmark: Core.BookmarkModelSchema) {
    super(bookmark);
    this.userId = bookmark.userId;
    this.postId = bookmark.postId;
    this.created_at = bookmark.created_at;
    this.updated_at = bookmark.updated_at;
  }

  /**
   * Find all bookmarks for a specific user
   */
  static async findByUserId(userId: Core.Pubky): Promise<Core.BookmarkModelSchema[]> {
    return this.table.where('userId').equals(userId).toArray();
  }

  /**
   * Find bookmark by user and post
   */
  static async findByUserAndPost(userId: Core.Pubky, postId: string): Promise<BookmarkModel | null> {
    const bookmarkId = `${userId}:${postId}`;
    return this.findById(bookmarkId);
  }

  /**
   * Check if a user has bookmarked a post
   */
  static async existsByUserAndPost(userId: Core.Pubky, postId: string): Promise<boolean> {
    const bookmarkId = `${userId}:${postId}`;
    return this.exists(bookmarkId);
  }
}
