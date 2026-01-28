import { useCallback } from 'react';

import * as Libs from '@/libs';
import * as Molecules from '@/molecules';

interface UseCopyToClipboardOptions {
  onSuccess?: (text: string) => void;
  onError?: (error: Error) => void;
  successTitle?: string;
  errorTitle?: string;
  errorDescription?: string;
}

/**
 * Truncates a string to a maximum length with ellipsis
 */
function truncateText(text: string, maxLength: number = 40): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
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

        Molecules.toast.success(successTitle, {
          description: truncateText(text),
          action: {
            label: 'OK',
            onClick: () => {}, // Sonner auto-closes on action click
          },
        });

        onSuccess?.(text);
        return true;
      } catch (error) {
        Molecules.toast.error(errorTitle, {
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
