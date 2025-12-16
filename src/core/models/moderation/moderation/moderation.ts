import { Table } from 'dexie';
import * as Core from '@/core';
import { RecordModelBase } from '@/core/models/shared/base/record/baseRecord';

export class ModerationModel
  extends RecordModelBase<string, Core.ModerationModelSchema>
  implements Core.ModerationModelSchema
{
  static table: Table<Core.ModerationModelSchema> = Core.db.table('moderation');

  created_at: number;

  constructor(data: Core.ModerationModelSchema) {
    super(data);
    this.created_at = data.created_at;
  }
}
