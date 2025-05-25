export interface Todo {
  id?: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export const todoTableSchema = '++id, title, completed, createdAt'; 