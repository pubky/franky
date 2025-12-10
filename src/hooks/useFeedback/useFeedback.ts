'use client';

import { useState, useCallback, useMemo } from 'react';
import { POST_MAX_CHARACTER_LENGTH } from '@/config';

/**
 * Custom hook to handle feedback submission
 *
 * @returns Object containing feedback state, handleChange function, submit method, isSubmitting state, isSuccess state, hasContent flag, and reset function
 *
 * @example
 * ```tsx
 * const { feedback, handleChange, submit, isSubmitting, isSuccess, hasContent, reset } = useFeedback();
 *
 * <Textarea value={feedback} onChange={handleChange} />
 * <Button onClick={submit} disabled={!hasContent || isSubmitting}>Send</Button>
 * ```
 */
export function useFeedback() {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= POST_MAX_CHARACTER_LENGTH) {
      setFeedback(value);
    }
  }, []);

  const submit = useCallback(async () => {
    if (!feedback.trim() || isSubmitting) return;

    setIsSubmitting(true);
    // TODO: Implement actual feedback submission API call
    // For now, simulate submission
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    setIsSuccess(true);
  }, [feedback, isSubmitting]);

  const reset = useCallback(() => {
    setFeedback('');
    setIsSuccess(false);
    setIsSubmitting(false);
  }, []);

  const hasContent = useMemo(() => feedback.trim().length > 0, [feedback]);

  return {
    feedback,
    handleChange,
    submit,
    isSubmitting,
    isSuccess,
    hasContent,
    reset,
  };
}
