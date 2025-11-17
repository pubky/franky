import { Table } from 'dexie';

import * as Core from '@/core';
import { RecordModelBase } from '@/core/models/shared/base/record/baseRecord';

export class FileDetailsModel
  extends RecordModelBase<Core.Pubky, Core.FileDetailsModelSchema>
  implements Core.FileDetailsModelSchema
{
  static table: Table<Core.FileDetailsModelSchema> = Core.db.table('file_details');

  name: string;
  src: string;
  content_type: string;
  size: number;
  created_at: number;
  indexed_at: number;

  constructor(fileDetails: Core.FileDetailsModelSchema) {
    super(fileDetails);
    this.name = fileDetails.name;
    this.src = fileDetails.src;
    this.content_type = fileDetails.content_type;
    this.size = fileDetails.size;
    this.created_at = fileDetails.created_at;
    this.indexed_at = fileDetails.indexed_at;
  }

  // Query methods
  static async fetchPaginated(limit: number = 30, offset: number = 0) {
    return this.table.orderBy('indexed_at').reverse().offset(offset).limit(limit).toArray();
  }
}

