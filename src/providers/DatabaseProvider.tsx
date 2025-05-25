'use client';

import { createContext, useEffect, useState, type ReactNode } from 'react';
import db from '@/database';
import { logger } from '@/lib/logger';

interface DatabaseContextType {
  isReady: boolean;
  error: Error | null;
}

export const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        await db.initialize();
        logger.info('Database initialized successfully');
        setIsReady(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize database');
        logger.error('Database initialization failed:', error);
        setError(error);
      }
    };

    initDatabase();
  }, []);

  return (
    <DatabaseContext.Provider value={{ isReady, error }}>
      {children}
    </DatabaseContext.Provider>
  );
} 