'use client';

import { useRef } from 'react';

interface UseEnterSubmitOptions {
  /**
   * If true, ignores Shift+Enter to allow newlines in multiline inputs.
   * @default true
   */
  ignoreShiftEnter?: boolean;
}

/**
 * Custom hook to handle Enter key submission with IME composition and double-submit guards
 *
 * @param isValid - Function that returns whether the form is valid and ready to submit
 * @param onSubmit - Function to call when Enter is pressed and form is valid
 * @param options - Optional configuration object
 * @returns onKeyDown event handler to be attached to form inputs
 *
 * @example
 * ```tsx
 * const isFormValid = () => password && passwordsMatch;
 * const handleKeyDown = useEnterSubmit(isFormValid, handleDownload);
 *
 * <Input onKeyDown={handleKeyDown} />
 * ```
 *
 * @example
 * ```tsx
 * // For textarea with Shift+Enter support for newlines
 * const handleKeyDown = useEnterSubmit(isFormValid, handleSubmit, { ignoreShiftEnter: true });
 *
 * <Textarea onKeyDown={handleKeyDown} />
 * ```
 */
export function useEnterSubmit(
  isValid: () => boolean,
  onSubmit: () => void | Promise<void>,
  options: UseEnterSubmitOptions = { ignoreShiftEnter: true },
) {
  const isSubmittingRef = useRef(false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Guard against IME composition (prevents accidental submit while composing CJK input)
    if (e.nativeEvent.isComposing) return;

    // Guard against Shift+Enter for multiline inputs (if enabled)
    if (options.ignoreShiftEnter && e.shiftKey) return;

    // Guard against double-submit race condition
    if (isSubmittingRef.current) return;

    if (e.key === 'Enter' && isValid()) {
      e.preventDefault();

      isSubmittingRef.current = true;

      const result = onSubmit();

      // Robust thenable detection: normalize with Promise.resolve
      // This works across realms/polyfills and handles both sync and async consistently
      Promise.resolve(result).finally(() => {
        isSubmittingRef.current = false;
      });
    }
  };

  return onKeyDown;
}
