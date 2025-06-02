'use client';

import { AppError, CommonErrorType } from '@/lib/error';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Convert to AppError if it's not already one
    if (!(error instanceof AppError)) {
      new AppError(CommonErrorType.UNEXPECTED_ERROR, error.message || 'An unexpected error occurred', 500, {
        originalError: error,
      });
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-5">
      <div className="w-full max-w-2xl rounded-lg bg-card p-8 text-center shadow-md">
        <h1 className="mb-4 text-xl font-semibold text-destructive">Something went wrong</h1>
        <p className="mb-6 text-muted-foreground">
          {error instanceof AppError ? error.message : 'An unexpected error occurred'}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-primary hover:underline">Error Details</summary>
            <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-4 text-sm">
              {error instanceof AppError ? JSON.stringify(error, null, 2) : error.toString()}
            </pre>
          </details>
        )}
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
