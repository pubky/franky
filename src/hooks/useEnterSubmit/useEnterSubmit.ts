'use client';

import { useRef } from 'react';

/**
 * Custom hook to handle Enter key submission with IME composition and double-submit guards
 *
 * @param isValid - Function that returns whether the form is valid and ready to submit
 * @param onSubmit - Function to call when Enter is pressed and form is valid
 * @returns onKeyDown event handler to be attached to form inputs
 *
 * @example
 * ```tsx
 * const isFormValid = () => password && passwordsMatch;
 * const handleKeyDown = useEnterSubmit(isFormValid, handleDownload);
 *
 * <Input onKeyDown={handleKeyDown} />
 * ```
 */
export function useEnterSubmit(isValid: () => boolean, onSubmit: () => void | Promise<void>) {
  const isSubmittingRef = useRef(false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Guard against IME composition (prevents accidental submit while composing CJK input)
    if (e.nativeEvent.isComposing) return;

    // Guard against double-submit race condition
    if (isSubmittingRef.current) return;

    if (e.key === 'Enter' && isValid()) {
      e.preventDefault();

      isSubmittingRef.current = true;

      const result = onSubmit();

      // If onSubmit is async, wait for it to complete before allowing another submit
      if (result instanceof Promise) {
        result.finally(() => {
          isSubmittingRef.current = false;
        });
      } else {
        // Reset immediately for synchronous functions
        isSubmittingRef.current = false;
      }
    }
  };

  return onKeyDown;
}
