import React, { useCallback } from 'react';

import { copyToClipboard } from '../utils/utils';
import { toast } from '@/molecules/Toaster/use-toast';
import { Button } from '@/atoms/Button';

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
        await copyToClipboard(text);

        const toastInstance = toast({
          title: successTitle,
          description: text,
          action: (
            <Button
              variant="outline"
              className="rounded-full h-10 px-4 bg-transparent border-brand text-white hover:bg-brand/20"
              onClick={() => toastInstance.dismiss()}
            >
              OK
            </Button>
          ),
        });

        onSuccess?.(text);
      } catch (error) {
        toast({
          title: errorTitle,
          description: errorDescription,
        });

        onError?.(error as Error);
      }
    },
    [onSuccess, onError, successTitle, errorTitle, errorDescription],
  );

  return { copyToClipboard: copyToClipboardHandler };
}
