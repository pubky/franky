import { Table } from 'dexie';

import * as Core from '@/core';
import { RecordModelBase } from '@/core/models/shared/base/record/baseRecord';

export class PostDetailsModel
  extends RecordModelBase<string, Core.PostDetailsModelSchema>
  implements Core.PostDetailsModelSchema
{
  static table: Table<Core.PostDetailsModelSchema> = Core.db.table('post_details');

  content: string;
  indexed_at: number;
  kind: Core.NexusPostKind;
  uri: string;
  attachments: string[] | null;

  constructor(postDetails: Core.PostDetailsModelSchema) {
    super(postDetails);
    this.content = postDetails.content;
    this.indexed_at = postDetails.indexed_at;
    this.kind = postDetails.kind;
    this.uri = postDetails.uri;
    this.attachments = postDetails.attachments;
  }

  // Query methods
  static async fetchPaginated(limit: number = 30, offset: number = 0) {
    return this.table.orderBy('indexed_at').reverse().offset(offset).limit(limit).toArray();
  }
}
