import { Table } from 'dexie';

import * as Core from '@/core';
import { RecordModelBase } from '@/core/models/shared/base/record/baseRecord';
import { BookmarkModelSchema } from './bookmark.schema';

export class BookmarkModel extends RecordModelBase<string, BookmarkModelSchema> implements BookmarkModelSchema {
  static table: Table<BookmarkModelSchema> = Core.db.table('bookmarks');

  bookmark_id: string;
  indexed_at: string;

  constructor(bookmark: BookmarkModelSchema) {
    super(bookmark);
    this.bookmark_id = bookmark.bookmark_id;
    this.indexed_at = bookmark.indexed_at;
  }
}
