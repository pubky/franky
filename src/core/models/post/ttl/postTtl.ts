import { Table } from 'dexie';

import { Ttl } from '@/core/models/shared';
import { PostTtlModelSchema } from './postTtl.schema';
import * as Core from '@/core';

export class PostTtlModel extends Ttl<string, PostTtlModelSchema> implements PostTtlModelSchema {
  static table: Table<PostTtlModelSchema> = Core.db.table('post_ttl');

  constructor(postTtl: PostTtlModelSchema) {
    super(postTtl);
  }
}
