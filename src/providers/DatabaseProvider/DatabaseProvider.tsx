'use client';

import { createContext, useEffect, useState, type ReactNode } from 'react';
import * as Atoms from '@/atoms';
import { AppError, Err, ErrorService, DatabaseErrorCode } from '@/libs';
import { DatabaseContextType } from '@/providers';
import { db } from '@/core';

export const DatabaseContext = createContext<DatabaseContextType>({
  isReady: false,
  error: null,
  retry: async () => {},
});

/**
 * DatabaseProvider initializes the Dexie database and blocks rendering
 * until the database is ready. This prevents race conditions where
 * components try to query the database before it's initialized.
 */
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const initDatabase = async () => {
    try {
      setError(null);
      await db.initialize();
      setIsReady(true);
    } catch (err) {
      setIsReady(false);
      if (err instanceof AppError) {
        setError(err);
      } else {
        // If it's not our AppError, it's likely a critical error from Dexie or browser
        setError(
          Err.database(DatabaseErrorCode.INIT_FAILED, 'Unexpected error during database initialization', {
            service: ErrorService.Local,
            operation: 'initDatabase',
            cause: err,
          }),
        );
      }
    }
  };

  useEffect(() => {
    initDatabase();
  }, []);

  // Block rendering until database is ready
  // This prevents components from querying before initialization
  if (!isReady && !error) {
    return (
      <Atoms.Container overrideDefaults className="flex min-h-screen items-center justify-center">
        <Atoms.Spinner />
      </Atoms.Container>
    );
  }

  return (
    <DatabaseContext.Provider
      value={{
        isReady,
        error,
        retry: initDatabase,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}
