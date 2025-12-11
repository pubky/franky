import React, { useCallback } from 'react';

import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import type { UseCopyToClipboardOptions } from './useCopyToClipboard.types';

export type { UseCopyToClipboardOptions } from './useCopyToClipboard.types';

export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}): {
  copyToClipboard: (text: string) => Promise<boolean>;
} {
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
    [onSuccess, onError, successTitle, errorTitle, errorDescription],
  );

  return { copyToClipboard: copyToClipboardHandler };
}
