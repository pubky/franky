import Dexie from 'dexie';
import { logger } from '@/lib/logger';
import { DB_VERSION, DB_NAME } from './config';
import { todoTableSchema } from './schemas/todo';
import type { Todo } from './schemas/todo';

class AppDatabase extends Dexie {
  todos!: Dexie.Table<Todo>;

  constructor() {
    super(DB_NAME);
    
    this.version(DB_VERSION).stores({
      todos: todoTableSchema,
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