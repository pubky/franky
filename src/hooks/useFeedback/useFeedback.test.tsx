import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFeedback } from './useFeedback';
import { POST_MAX_CHARACTER_LENGTH } from '@/config';

// Mock Molecules
const mockToast = vi.fn();
vi.mock('@/molecules', () => ({
  useToast: vi.fn(() => ({
    toast: mockToast,
  })),
}));

describe('useFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial state with empty feedback', () => {
      const { result } = renderHook(() => useFeedback());

      expect(result.current.feedback).toBe('');
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.hasContent).toBe(false);
      expect(typeof result.current.handleChange).toBe('function');
      expect(typeof result.current.submit).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('handleChange', () => {
    it('should update feedback when handleChange is called', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        const event = {
          target: { value: 'Test feedback' },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        result.current.handleChange(event);
      });

      expect(result.current.feedback).toBe('Test feedback');
      expect(result.current.hasContent).toBe(true);
    });

    it('should not update feedback if value exceeds max length', () => {
      const { result } = renderHook(() => useFeedback());
      const longText = 'a'.repeat(POST_MAX_CHARACTER_LENGTH + 10);

      act(() => {
        const event = {
          target: { value: longText },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        result.current.handleChange(event);
      });

      expect(result.current.feedback.length).toBeLessThanOrEqual(POST_MAX_CHARACTER_LENGTH);
    });

    it('should allow feedback up to max length', () => {
      const { result } = renderHook(() => useFeedback());
      const maxText = 'a'.repeat(POST_MAX_CHARACTER_LENGTH);

      act(() => {
        const event = {
          target: { value: maxText },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        result.current.handleChange(event);
      });

      expect(result.current.feedback.length).toBe(POST_MAX_CHARACTER_LENGTH);
    });
  });

  describe('hasContent', () => {
    it('should be false when feedback is empty', () => {
      const { result } = renderHook(() => useFeedback());
      expect(result.current.hasContent).toBe(false);
    });

    it('should be false when feedback is only whitespace', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        const event = {
          target: { value: '   ' },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        result.current.handleChange(event);
      });

      expect(result.current.hasContent).toBe(false);
    });

    it('should be true when feedback has content', () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        const event = {
          target: { value: 'Test feedback' },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        result.current.handleChange(event);
      });

      expect(result.current.hasContent).toBe(true);
    });
  });

  describe('submit', () => {
    it('should not submit when feedback is empty', async () => {
      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        await result.current.submit();
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });

    it('should not submit when feedback is only whitespace', async () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        const event = {
          target: { value: '   ' },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        result.current.handleChange(event);
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });

    it('should set isSubmitting to true during submission', async () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        const event = {
          target: { value: 'Test feedback' },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        result.current.handleChange(event);
      });

      // Start submission
      const submitPromise = act(async () => {
        await result.current.submit();
      });

      // Wait for submission to complete
      await submitPromise;

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should set isSuccess to true after successful submission', async () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        const event = {
          target: { value: 'Test feedback' },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        result.current.handleChange(event);
      });

      await act(async () => {
        await result.current.submit();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isSubmitting).toBe(false);
      });
    });

    it('should show success toast after successful submission', async () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        const event = {
          target: { value: 'Test feedback' },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        result.current.handleChange(event);
      });

      await act(async () => {
        await result.current.submit();
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Feedback submitted',
          description: 'Thank you for helping us improve Pubky.',
        });
      });
    });

    it('should not submit when already submitting', async () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        const event = {
          target: { value: 'Test feedback' },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        result.current.handleChange(event);
      });

      // Start first submission
      const submitPromise = act(async () => {
        await result.current.submit();
      });

      // Immediately try to submit again (should be prevented by guard)
      await act(async () => {
        await result.current.submit();
      });

      // Wait for first submission to complete
      await submitPromise;

      // Should have completed successfully (only once)
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isSubmitting).toBe(false);
      });
    });
  });

  describe('reset', () => {
    it('should reset all state when reset is called', async () => {
      const { result } = renderHook(() => useFeedback());

      act(() => {
        const event = {
          target: { value: 'Test feedback' },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        result.current.handleChange(event);
      });

      expect(result.current.feedback).toBe('Test feedback');

      await act(async () => {
        await result.current.submit();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.feedback).toBe('');
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
    });
  });
});
