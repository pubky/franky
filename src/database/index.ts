import Dexie from 'dexie';
import { logger } from '@/lib/logger';
import { DB_VERSION, DB_NAME } from './config';
import { userTableSchema } from './schemas/user';
import { postTableSchema } from './schemas/post';
import type { User } from './schemas/user';
import type { Post } from './schemas/post';
import { createDatabaseError, DatabaseErrorType } from '@/lib/error';

class AppDatabase extends Dexie {
  users!: Dexie.Table<User>;
  posts!: Dexie.Table<Post>;

  constructor() {
    super(DB_NAME);

    try {
      this.version(DB_VERSION).stores({
        users: userTableSchema,
        posts: postTableSchema,
      });
    } catch (error) {
      throw createDatabaseError(DatabaseErrorType.DB_SCHEMA_ERROR, 'Failed to initialize database schema', 500, {
        error,
      });
    }
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
        try {
          await this.delete();
        } catch (error) {
          throw createDatabaseError(DatabaseErrorType.DB_DELETE_FAILED, 'Failed to delete outdated database', 500, {
            error,
            currentVersion,
            expectedVersion: DB_VERSION,
          });
        }

        try {
          await this.open();
          logger.info('Database recreated with new schema');
        } catch (error) {
          throw createDatabaseError(DatabaseErrorType.DB_OPEN_FAILED, 'Failed to open database after recreation', 500, {
            error,
            version: DB_VERSION,
          });
        }
      } else {
        logger.debug('Database version is current');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw createDatabaseError(DatabaseErrorType.DB_INIT_FAILED, 'Failed to initialize database', 500, { error });
    }
  }
}

export const db = new AppDatabase();
