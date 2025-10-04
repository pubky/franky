'use client';

import { useCallback, useRef } from 'react';

import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import { useToast } from '@/molecules/Toaster/use-toast';

interface UseCopyToClipboardOptions {
  onSuccess?: (text: string) => void;
  onError?: (error: Error) => void;
  successTitle?: string;
  errorTitle?: string;
  errorDescription?: string;
}

export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}) {
  const { dismiss } = useToast();
  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;

  const {
    onSuccess,
    onError,
    successTitle = 'Pubky copied to clipboard',
    errorTitle = 'Copy failed',
    errorDescription = 'Unable to copy to clipboard',
  } = options;

  const copyToClipboardHandler = useCallback(
    async (text: string) => {
      try {
        await Libs.copyToClipboard({ text });

        const toastInstance = Molecules.toast({
          title: successTitle,
          description: text,
          action: {
            label: 'OK',
            onClick: () => dismissRef.current(String(toastInstance)),
          },
        });

        onSuccess?.(text);
      } catch (error) {
        Molecules.toast({
          title: errorTitle,
          description: errorDescription,
          variant: 'error',
        });

        onError?.(error as Error);
      }
    },
    [onSuccess, onError, successTitle, errorTitle, errorDescription],
  );

  return { copyToClipboard: copyToClipboardHandler };
}
