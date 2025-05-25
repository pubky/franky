import { beforeEach, describe, expect, it } from 'vitest';
import { createTestData, clearTable } from '@/test/helpers';
import { todoModel } from '@/database/models';
import db from '@/database';
import { indexedDB } from 'fake-indexeddb';
import { DB_NAME } from '@/database/config';

describe('TodoModel', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await db.close();
    indexedDB.deleteDatabase(DB_NAME);
    await db.open();
  });

  it('should add a new todo', async () => {
    const newTodo = {
      title: 'Test todo',
      completed: false,
      createdAt: new Date()
    };

    const id = await todoModel.add(newTodo);
    expect(id).toBeDefined();
    expect(typeof id).toBe('number');

    // Verify if todo was actually saved
    const todos = await db.todos.toArray();
    expect(todos).toHaveLength(1);
    expect(todos[0]).toMatchObject(newTodo);
  });

  it('should get all todos', async () => {
    const testTodos = [
      { title: 'Test 1', completed: false, createdAt: new Date() },
      { title: 'Test 2', completed: true, createdAt: new Date() },
      { title: 'Test 3', completed: false, createdAt: new Date() }
    ];

    // Use our helper to create test data
    await createTestData(db.todos, testTodos);

    const todos = await todoModel.getAll();
    
    expect(todos).toHaveLength(testTodos.length);
    todos.forEach((todo, index) => {
      expect(todo).toMatchObject(testTodos[index]);
    });
  });

  it('should clear all todos', async () => {
    // Create some test todos first
    const testTodos = [
      { title: 'Test 1', completed: false, createdAt: new Date() },
      { title: 'Test 2', completed: true, createdAt: new Date() }
    ];
    await createTestData(db.todos, testTodos);

    // Use our helper to clear the table
    await clearTable(db.todos);

    const todos = await todoModel.getAll();
    expect(todos).toHaveLength(0);
  });
}); 