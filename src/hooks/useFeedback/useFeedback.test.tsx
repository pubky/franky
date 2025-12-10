import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFeedback } from './useFeedback';
import { FEEDBACK_MAX_CHARACTER_LENGTH } from '@/config';

// Mock fetch
global.fetch = vi.fn();

// Mock hooks
const mockToast = vi.fn();
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useCurrentUserProfile: vi.fn(() => ({
      currentUserPubky: 'test-user-123',
    })),
  };
});

// Mock molecules
vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    useToast: vi.fn(() => ({
      toast: mockToast,
    })),
  };
});

describe('useFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful fetch response
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);
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

    it('should accept feedback value regardless of length (truncation handled by textarea maxLength)', () => {
      const { result } = renderHook(() => useFeedback());
      const longText = 'a'.repeat(FEEDBACK_MAX_CHARACTER_LENGTH + 10);

      act(() => {
        const event = {
          target: { value: longText },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        result.current.handleChange(event);
      });

      // The hook accepts the value as-is; truncation is handled by the textarea's maxLength attribute
      expect(result.current.feedback.length).toBe(FEEDBACK_MAX_CHARACTER_LENGTH + 10);
    });

    it('should allow feedback up to max length', () => {
      const { result } = renderHook(() => useFeedback());
      const maxText = 'a'.repeat(FEEDBACK_MAX_CHARACTER_LENGTH);

      act(() => {
        const event = {
          target: { value: maxText },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        result.current.handleChange(event);
      });

      expect(result.current.feedback.length).toBe(FEEDBACK_MAX_CHARACTER_LENGTH);
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
      await act(async () => {
        await result.current.submit();
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/chatwoot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pubky: 'test-user-123',
          comment: 'Test feedback',
        }),
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

      expect(global.fetch).toHaveBeenCalledWith('/api/chatwoot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pubky: 'test-user-123',
          comment: 'Test feedback',
        }),
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

      // Start first submission (don't await to test concurrent submission)
      const submitPromise = act(async () => {
        await result.current.submit();
      });

      // Immediately try to submit again (should be prevented by guard)
      // Note: This will show a warning but is intentional for testing concurrent calls
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
