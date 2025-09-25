import { Table } from 'dexie';

import * as Core from '@/core';
import { RecordModelBase } from '@/core/models/shared/base/record/baseRecord';

export class UserDetailsModel
  extends RecordModelBase<Core.Pubky, Core.UserDetailsModelSchema>
  implements Core.UserDetailsModelSchema
{
  static table: Table<Core.UserDetailsModelSchema> = Core.db.table('user_details');

  name: string;
  bio: string;
  image: string | null;
  indexed_at: number;
  links: Core.NexusUserLink[] | null;
  status: string | null;

  constructor(userDetails: Core.UserDetailsModelSchema) {
    super(userDetails);
    this.name = userDetails.name;
    this.bio = userDetails.bio;
    this.image = userDetails.image;
    this.indexed_at = userDetails.indexed_at;
    this.links = userDetails.links;
    this.status = userDetails.status;
  }
}
