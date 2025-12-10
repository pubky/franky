'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import * as Hooks from '@/hooks';
import * as Molecules from '@/molecules';

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
  const { currentUserPubky } = Hooks.useCurrentUserProfile();
  const { toast } = Molecules.useToast();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Use ref to store the current feedback value to avoid dependency in submit callback
  const feedbackRef = useRef(feedback);

  // Keep ref in sync with the state
  useEffect(() => {
    feedbackRef.current = feedback;
  }, [feedback]);

  const showErrorToast = useCallback(
    (description: string) => {
      toast({
        title: 'Error',
        description,
        className: 'destructive border-destructive bg-destructive text-destructive-foreground',
      });
    },
    [toast],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(e.target.value);
  }, []);

  const submit = useCallback(async () => {
    // Read current feedback value from ref to avoid dependency
    const currentFeedback = feedbackRef.current.trim();

    if (!currentFeedback || isSubmitting || !currentUserPubky) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/chatwoot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pubky: currentUserPubky,
          comment: currentFeedback,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || 'Failed to submit feedback';
        showErrorToast(errorMessage);
        return;
      }

      setIsSuccess(true);
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showErrorToast('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, currentUserPubky, showErrorToast]);

  const reset = useCallback(() => {
    setFeedback('');
    feedbackRef.current = '';
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
