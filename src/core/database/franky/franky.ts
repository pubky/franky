import Dexie from 'dexie';
import { Logger, createDatabaseError, DatabaseErrorType } from '@/libs';
import { DB_VERSION, DB_NAME } from '@/config';
import { UserSchema, userTableSchema } from '@/core/models/user/user.schema';
import { PostSchema, postTableSchema } from '@/core/models/post/posts.schema';

class AppDatabase extends Dexie {
  users!: Dexie.Table<UserSchema>;
  posts!: Dexie.Table<PostSchema>;

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
        Logger.info('Creating new database...');
        await this.open();
        return;
      }

      const currentVersion = this.verno;

      if (currentVersion !== DB_VERSION) {
        Logger.info(`Database version mismatch. Current: ${currentVersion}, Expected: ${DB_VERSION}`);
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
          Logger.info('Database recreated with new schema');
        } catch (error) {
          throw createDatabaseError(DatabaseErrorType.DB_OPEN_FAILED, 'Failed to open database after recreation', 500, {
            error,
            version: DB_VERSION,
          });
        }
      } else {
        Logger.debug('Database version is current');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw createDatabaseError(DatabaseErrorType.DB_INIT_FAILED, 'Failed to initialize database', 500, { error });
    }
  }
}

export const db = new AppDatabase();
