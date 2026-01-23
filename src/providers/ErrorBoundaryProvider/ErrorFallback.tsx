'use client';

import * as Atoms from '@/atoms';
import { getErrorMessage } from '@/libs/error';
import type { ErrorFallbackProps } from './ErrorBoundaryProvider.types';

/**
 * ErrorFallback
 *
 * Fallback UI displayed when an unhandled error occurs during React render.
 * Shows a user-friendly error message.
 */
export function ErrorFallback({ error }: ErrorFallbackProps) {
  const message = getErrorMessage(error);

  return (
    <Atoms.Container className="flex min-h-[50vh] flex-col items-center justify-center p-8">
      <Atoms.Container className="flex flex-col items-center gap-2 text-center">
        <Atoms.Typography as="h2" size="lg">
          Something went wrong
        </Atoms.Typography>
        <Atoms.Typography size="md" className="text-destructive">
          {message}
        </Atoms.Typography>
      </Atoms.Container>
    </Atoms.Container>
  );
}
