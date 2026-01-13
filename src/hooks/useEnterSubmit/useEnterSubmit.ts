'use client';

import { useRef } from 'react';

interface UseEnterSubmitOptions {
  /**
   * If true, ignores Shift+Enter to allow newlines in multiline inputs.
   * @default true
   */
  ignoreShiftEnter?: boolean;
  /**
   * If true, requires Ctrl (Windows/Linux) or Cmd (Mac) to be pressed with Enter.
   * Useful for multiline inputs where plain Enter should insert a newline.
   * @default false
   */
  requireModifier?: boolean;
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
 *
 * @example
 * ```tsx
 * // For multiline input where Ctrl/Cmd+Enter submits
 * const handleKeyDown = useEnterSubmit(isFormValid, handleSubmit, { requireModifier: true });
 *
 * <Textarea onKeyDown={handleKeyDown} />
 * ```
 */
export function useEnterSubmit(
  isValid: () => boolean,
  onSubmit: () => void | Promise<void>,
  options: UseEnterSubmitOptions = { ignoreShiftEnter: true, requireModifier: false },
) {
  const isSubmittingRef = useRef(false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Guard against IME composition (prevents accidental submit while composing CJK input)
    if (e.nativeEvent.isComposing) return;

    // Guard against Shift+Enter for multiline inputs (if enabled)
    if (options.ignoreShiftEnter && e.shiftKey) return;

    // Guard against double-submit race condition
    if (isSubmittingRef.current) return;

    // Check if modifier key is required (Ctrl on Windows/Linux, Cmd on Mac)
    const hasModifier = e.ctrlKey || e.metaKey;
    if (options.requireModifier && !hasModifier) return;

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
