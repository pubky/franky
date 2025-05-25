import { Table } from 'dexie';
import { logger } from '@/lib/logger';
import type { Todo } from '../schemas/todo';
import db from '@/database';

export class TodoModel {
  private table: Table<Todo>;

  constructor() {
    this.table = db.table('todos');
  }

  async add(todo: Omit<Todo, 'id'>) {
    try {
      const id = await this.table.add(todo);
      logger.debug('Added todo:', { id, ...todo });
      return id;
    } catch (error) {
      logger.error('Failed to add todo:', error);
      throw error;
    }
  }

  async getAll() {
    try {
      const todos = await this.table.toArray();
      logger.debug('Retrieved todos:', todos.length);
      return todos;
    } catch (error) {
      logger.error('Failed to get todos:', error);
      throw error;
    }
  }

  // Add more methods as needed
}

export const todoModel = new TodoModel(); 