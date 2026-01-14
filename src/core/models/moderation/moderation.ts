import { Table } from 'dexie';
import * as Core from '@/core';
import { RecordModelBase } from '@/core/models/shared/base/record/baseRecord';
import { ModerationType } from './moderation.schema';

export class ModerationModel
  extends RecordModelBase<string, Core.ModerationModelSchema>
  implements Core.ModerationModelSchema
{
  static table: Table<Core.ModerationModelSchema> = Core.db.table('moderation');

  type: ModerationType;
  is_blurred: boolean;
  created_at: number;

  constructor(data: Core.ModerationModelSchema) {
    super(data);
    this.type = data.type;
    this.is_blurred = data.is_blurred;
    this.created_at = data.created_at;
  }
}
