import React, { useCallback } from 'react';

import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';

interface UseCopyToClipboardOptions {
  onSuccess?: (text: string) => void;
  onError?: (error: Error) => void;
  successTitle?: string;
  successDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
}

export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}) {
  const {
    onSuccess,
    onError,
    successTitle = 'Pubky copied to clipboard',
    successDescription,
    errorTitle = 'Copy failed',
    errorDescription = 'Unable to copy to clipboard',
  } = options;

  const copyToClipboardHandler = useCallback(
    async (text: string) => {
      try {
        await Libs.copyToClipboard({ text });

        const toastInstance = Molecules.toast({
          title: successTitle,
          ...(successDescription !== undefined
            ? successDescription !== '' && { description: successDescription }
            : { description: text }),
          action: (
            <Atoms.Button
              variant="outline"
              className="h-10 rounded-full border-brand bg-transparent px-4 text-white hover:bg-brand/16"
              onClick={() => toastInstance.dismiss()}
            >
              OK
            </Atoms.Button>
          ),
        });

        onSuccess?.(text);
        return true;
      } catch (error) {
        Molecules.toast({
          title: errorTitle,
          description: errorDescription,
        });

        onError?.(error as Error);
        return false;
      }
    },
    [onSuccess, onError, successTitle, successDescription, errorTitle, errorDescription],
  );

  return { copyToClipboard: copyToClipboardHandler };
}
