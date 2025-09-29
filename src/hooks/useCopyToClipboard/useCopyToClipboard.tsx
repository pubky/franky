import React, { useCallback } from 'react';

import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';

interface UseCopyToClipboardOptions {
  onSuccess?: (text: string) => void;
  onError?: (error: Error) => void;
  successTitle?: string;
  errorTitle?: string;
  errorDescription?: string;
}

export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}) {
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
          action: (
            <Atoms.Button
              variant="outline"
              className="rounded-full h-10 px-4 dark:border-brand text-brand"
              onClick={() => toastInstance.dismiss()}
            >
              OK
            </Atoms.Button>
          ),
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
