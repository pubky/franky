import Dexie, { Table } from 'dexie';
import { IUserModel } from './user/types';

export class Database extends Dexie {
  users!: Table<IUserModel>;

  constructor() {
    super('franky_db');

    this.version(1).stores({
      users: 'id, indexed_at, updated_at, sync_status, sync_ttl'
    });
  }
}

export const db = new Database(); 