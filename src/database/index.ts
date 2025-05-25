import Dexie from 'dexie';
import { logger } from '@/lib/logger';
import { DB_VERSION, DB_NAME } from './config';
import { userTableSchema } from './schemas/user';
import { postTableSchema } from './schemas/post';
import type { User } from './schemas/user';
import type { Post } from './schemas/post';

class AppDatabase extends Dexie {
  users!: Dexie.Table<User>;
  posts!: Dexie.Table<Post>;

  constructor() {
    super(DB_NAME);
    
    this.version(DB_VERSION).stores({
      users: userTableSchema,
      posts: postTableSchema,
    });
  }

  async initialize() {
    try {
      const db = await Dexie.exists(DB_NAME);
      
      if (!db) {
        logger.info('Creating new database...');
        await this.open();
        return;
      }

      const currentVersion = this.verno;

      if (currentVersion !== DB_VERSION) {
        logger.info(`Database version mismatch. Current: ${currentVersion}, Expected: ${DB_VERSION}`);
        await this.delete();
        await this.open();
        logger.info('Database recreated with new schema');
      } else {
        logger.debug('Database version is current');
      }
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      throw error;
    }
  }
}

const db = new AppDatabase();

export default db; 