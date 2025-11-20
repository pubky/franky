import { Table } from 'dexie';
import * as Core from '@/core';
import { RecordModelBase } from '@/core/models/shared/base/record/baseRecord';

export class BookmarkModel
  extends RecordModelBase<string, Core.BookmarkModelSchema>
  implements Core.BookmarkModelSchema
{
  static table: Table<Core.BookmarkModelSchema> = Core.db.table('bookmarks');

  created_at: number;

  constructor(bookmark: Core.BookmarkModelSchema) {
    super(bookmark);
    this.created_at = bookmark.created_at;
  }

  /**
   * Find all bookmarks (for current user)
   * Returns array of post IDs
   */
  static async findAll(): Promise<string[]> {
    const bookmarks = await this.table.toArray();
    return bookmarks.map((b) => b.id);
  }

  /**
   * Get bookmarks sorted by creation time (most recent first)
   */
  static async findAllSorted(): Promise<Core.BookmarkModelSchema[]> {
    return this.table.orderBy('created_at').reverse().toArray();
  }
}
