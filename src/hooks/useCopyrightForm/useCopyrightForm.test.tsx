import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCopyrightForm } from './useCopyrightForm';

// Mock @/molecules
const mockToast = vi.fn();
vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    useToast: () => ({
      toast: mockToast,
    }),
  };
});

// Mock fetch
global.fetch = vi.fn();

describe('useCopyrightForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.mocked(global.fetch).mockReset();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Success' }),
    } as Response);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useCopyrightForm());

      expect(result.current.state.isRightsOwner).toBe(true);
      expect(result.current.state.isReportingOnBehalf).toBe(false);
      expect(result.current.state.nameOwner).toBe('');
      expect(result.current.state.originalContentUrls).toBe('');
      expect(result.current.state.briefDescription).toBe('');
      expect(result.current.state.infringingContentUrl).toBe('');
      expect(result.current.state.firstName).toBe('');
      expect(result.current.state.lastName).toBe('');
      expect(result.current.state.email).toBe('');
      expect(result.current.state.phoneNumber).toBe('');
      expect(result.current.state.streetAddress).toBe('');
      expect(result.current.state.country).toBe('');
      expect(result.current.state.city).toBe('');
      expect(result.current.state.stateProvince).toBe('');
      expect(result.current.state.zipCode).toBe('');
      expect(result.current.state.signature).toBe('');
      expect(result.current.state.loading).toBe(false);
      expect(result.current.state.errors).toEqual({});
    });

    it('should provide currentDate in correct format', () => {
      const { result } = renderHook(() => useCopyrightForm());

      // Should match MM/DD/YYYY format
      expect(result.current.helpers.currentDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });
  });

  describe('state handlers', () => {
    it('should update nameOwner', () => {
      const { result } = renderHook(() => useCopyrightForm());

      act(() => {
        result.current.handlers.setNameOwner('John Doe');
      });

      expect(result.current.state.nameOwner).toBe('John Doe');
    });

    it('should update all text fields', () => {
      const { result } = renderHook(() => useCopyrightForm());

      act(() => {
        result.current.handlers.setOriginalContentUrls('https://example.com');
        result.current.handlers.setBriefDescription('My original work');
        result.current.handlers.setInfringingContentUrl('https://infringer.com');
        result.current.handlers.setFirstName('John');
        result.current.handlers.setLastName('Doe');
        result.current.handlers.setEmail('john@example.com');
        result.current.handlers.setPhoneNumber('123-456-7890');
        result.current.handlers.setStreetAddress('123 Main St');
        result.current.handlers.setCountry('United States');
        result.current.handlers.setCity('New York');
        result.current.handlers.setStateProvince('NY');
        result.current.handlers.setZipCode('10001');
        result.current.handlers.setSignature('John Doe');
      });

      expect(result.current.state.originalContentUrls).toBe('https://example.com');
      expect(result.current.state.briefDescription).toBe('My original work');
      expect(result.current.state.infringingContentUrl).toBe('https://infringer.com');
      expect(result.current.state.firstName).toBe('John');
      expect(result.current.state.lastName).toBe('Doe');
      expect(result.current.state.email).toBe('john@example.com');
      expect(result.current.state.phoneNumber).toBe('123-456-7890');
      expect(result.current.state.streetAddress).toBe('123 Main St');
      expect(result.current.state.country).toBe('United States');
      expect(result.current.state.city).toBe('New York');
      expect(result.current.state.stateProvince).toBe('NY');
      expect(result.current.state.zipCode).toBe('10001');
      expect(result.current.state.signature).toBe('John Doe');
    });
  });

  describe('checkbox handlers', () => {
    it('should handle rights owner checkbox - mutual exclusion', () => {
      const { result } = renderHook(() => useCopyrightForm());

      // Initially rights owner is checked
      expect(result.current.state.isRightsOwner).toBe(true);
      expect(result.current.state.isReportingOnBehalf).toBe(false);

      // Check reporting on behalf - should uncheck rights owner
      act(() => {
        result.current.handlers.handleReportingOnBehalfChange(true);
      });

      expect(result.current.state.isRightsOwner).toBe(false);
      expect(result.current.state.isReportingOnBehalf).toBe(true);

      // Check rights owner - should uncheck reporting on behalf
      act(() => {
        result.current.handlers.handleRightsOwnerChange(true);
      });

      expect(result.current.state.isRightsOwner).toBe(true);
      expect(result.current.state.isReportingOnBehalf).toBe(false);
    });

    it('should allow unchecking without affecting the other', () => {
      const { result } = renderHook(() => useCopyrightForm());

      // Uncheck rights owner
      act(() => {
        result.current.handlers.handleRightsOwnerChange(false);
      });

      expect(result.current.state.isRightsOwner).toBe(false);
      expect(result.current.state.isReportingOnBehalf).toBe(false);
    });
  });

  describe('helper functions', () => {
    it('should return correct status for fields with errors', () => {
      const { result } = renderHook(() => useCopyrightForm());

      // Initially no errors
      expect(result.current.helpers.getStatus('nameOwner')).toBe('default');

      // Trigger validation to generate errors
      act(() => {
        result.current.handlers.handleSubmit();
      });

      // Now should have error status for required fields
      expect(result.current.helpers.getStatus('nameOwner')).toBe('error');
    });

    it('should return correct messageType for fields with errors', () => {
      const { result } = renderHook(() => useCopyrightForm());

      // Initially no errors
      expect(result.current.helpers.getMessageType('email')).toBe('default');

      // Trigger validation to generate errors
      act(() => {
        result.current.handlers.handleSubmit();
      });

      // Now should have error messageType for required fields
      expect(result.current.helpers.getMessageType('email')).toBe('error');
    });
  });

  describe('validation', () => {
    it('should validate required fields', async () => {
      const { result } = renderHook(() => useCopyrightForm());

      await act(async () => {
        await result.current.handlers.handleSubmit();
      });

      expect(result.current.state.errors.nameOwner).toBe('Name of rights owner is required');
      expect(result.current.state.errors.originalContentUrls).toBe('Original content URLs are required');
      expect(result.current.state.errors.briefDescription).toBe('Brief description is required');
      expect(result.current.state.errors.infringingContentUrl).toBe('Infringing content URL is required');
      expect(result.current.state.errors.firstName).toBe('First name is required');
      expect(result.current.state.errors.lastName).toBe('Last name is required');
      expect(result.current.state.errors.email).toBe('Email is required');
      expect(result.current.state.errors.phoneNumber).toBe('Phone number is required');
      expect(result.current.state.errors.streetAddress).toBe('Street address is required');
      expect(result.current.state.errors.country).toBe('Country is required');
      expect(result.current.state.errors.city).toBe('City is required');
      expect(result.current.state.errors.stateProvince).toBe('State/Province is required');
      expect(result.current.state.errors.zipCode).toBe('Zip code is required');
      expect(result.current.state.errors.signature).toBe('Signature is required');
    });

    it('should validate email format', async () => {
      const { result } = renderHook(() => useCopyrightForm());

      act(() => {
        result.current.handlers.setEmail('invalid-email');
      });

      await act(async () => {
        await result.current.handlers.handleSubmit();
      });

      expect(result.current.state.errors.email).toBe('Please enter a valid email address');
    });

    it('should validate role selection', async () => {
      const { result } = renderHook(() => useCopyrightForm());

      // Uncheck both checkboxes
      act(() => {
        result.current.handlers.handleRightsOwnerChange(false);
      });

      await act(async () => {
        await result.current.handlers.handleSubmit();
      });

      expect(result.current.state.errors.role).toBe('Please select if you are the rights owner or reporting on behalf');
    });

    it('should not show role error when rights owner is checked', async () => {
      const { result } = renderHook(() => useCopyrightForm());

      // Rights owner is checked by default
      await act(async () => {
        await result.current.handlers.handleSubmit();
      });

      expect(result.current.state.errors.role).toBeUndefined();
    });

    it('should accept valid email formats', async () => {
      const { result } = renderHook(() => useCopyrightForm());

      act(() => {
        result.current.handlers.setEmail('valid@example.com');
      });

      await act(async () => {
        await result.current.handlers.handleSubmit();
      });

      // Email field should not have error (though other fields will)
      expect(result.current.state.errors.email).toBeUndefined();
    });
  });

  describe('form submission', () => {
    const fillAllFields = (handlers: ReturnType<typeof useCopyrightForm>['handlers']) => {
      handlers.setNameOwner('John Doe');
      handlers.setOriginalContentUrls('https://example.com/original');
      handlers.setBriefDescription('My original artwork');
      handlers.setInfringingContentUrl('https://example.com/infringing');
      handlers.setFirstName('John');
      handlers.setLastName('Doe');
      handlers.setEmail('john@example.com');
      handlers.setPhoneNumber('123-456-7890');
      handlers.setStreetAddress('123 Main St');
      handlers.setCountry('United States');
      handlers.setCity('New York');
      handlers.setStateProvince('NY');
      handlers.setZipCode('10001');
      handlers.setSignature('John Doe');
    };

    it('should submit form with valid data', async () => {
      const { result } = renderHook(() => useCopyrightForm());

      act(() => {
        fillAllFields(result.current.handlers);
      });

      await act(async () => {
        await result.current.handlers.handleSubmit();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/copyright', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"nameOwner":"John Doe"'),
      });
    });

    it('should set loading state during submission', async () => {
      vi.useFakeTimers();

      vi.mocked(global.fetch).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({ message: 'Success' }),
              } as Response);
            }, 100);
          }),
      );

      const { result } = renderHook(() => useCopyrightForm());

      act(() => {
        fillAllFields(result.current.handlers);
      });

      // Start submission
      let submitPromise: Promise<void>;
      act(() => {
        submitPromise = result.current.handlers.handleSubmit();
      });

      // Loading should be true while request is pending
      expect(result.current.state.loading).toBe(true);

      // Fast-forward timers and wait for completion
      await act(async () => {
        vi.advanceTimersByTime(100);
        await submitPromise;
      });

      expect(result.current.state.loading).toBe(false);

      vi.useRealTimers();
    });

    it('should show success toast on successful submission', async () => {
      const { result } = renderHook(() => useCopyrightForm());

      act(() => {
        fillAllFields(result.current.handlers);
      });

      await act(async () => {
        await result.current.handlers.handleSubmit();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Request sent successfully',
      });
    });

    it('should show error toast on failed submission', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Validation failed' }),
      } as Response);

      const { result } = renderHook(() => useCopyrightForm());

      act(() => {
        fillAllFields(result.current.handlers);
      });

      await act(async () => {
        await result.current.handlers.handleSubmit();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Validation failed',
        className: 'destructive border-destructive bg-destructive text-destructive-foreground',
      });
    });

    it('should reset form after successful submission', async () => {
      const { result } = renderHook(() => useCopyrightForm());

      act(() => {
        fillAllFields(result.current.handlers);
      });

      // Verify fields are filled
      expect(result.current.state.nameOwner).toBe('John Doe');

      await act(async () => {
        await result.current.handlers.handleSubmit();
      });

      // All fields should be reset
      expect(result.current.state.nameOwner).toBe('');
      expect(result.current.state.firstName).toBe('');
      expect(result.current.state.email).toBe('');
      expect(result.current.state.isRightsOwner).toBe(true);
      expect(result.current.state.isReportingOnBehalf).toBe(false);
      expect(result.current.state.errors).toEqual({});
    });

    it('should not reset form on failed submission', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      } as Response);

      const { result } = renderHook(() => useCopyrightForm());

      act(() => {
        fillAllFields(result.current.handlers);
      });

      await act(async () => {
        await result.current.handlers.handleSubmit();
      });

      // Fields should still be filled
      expect(result.current.state.nameOwner).toBe('John Doe');
    });

    it('should not call fetch if validation fails', async () => {
      const { result } = renderHook(() => useCopyrightForm());

      await act(async () => {
        await result.current.handlers.handleSubmit();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should include isRightsOwner and isReportingOnBehalf in submission', async () => {
      const { result } = renderHook(() => useCopyrightForm());

      act(() => {
        fillAllFields(result.current.handlers);
        result.current.handlers.handleReportingOnBehalfChange(true);
      });

      await act(async () => {
        await result.current.handlers.handleSubmit();
      });

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1]?.body as string);

      expect(body.isRightsOwner).toBe(false);
      expect(body.isReportingOnBehalf).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      const { result } = renderHook(() => useCopyrightForm());

      // Fill all fields first using synchronous act
      act(() => {
        result.current.handlers.setNameOwner('John Doe');
        result.current.handlers.setOriginalContentUrls('https://example.com/original');
        result.current.handlers.setBriefDescription('My original artwork');
        result.current.handlers.setInfringingContentUrl('https://example.com/infringing');
        result.current.handlers.setFirstName('John');
        result.current.handlers.setLastName('Doe');
        result.current.handlers.setEmail('john@example.com');
        result.current.handlers.setPhoneNumber('123-456-7890');
        result.current.handlers.setStreetAddress('123 Main St');
        result.current.handlers.setCountry('United States');
        result.current.handlers.setCity('New York');
        result.current.handlers.setStateProvince('NY');
        result.current.handlers.setZipCode('10001');
        result.current.handlers.setSignature('John Doe');
      });

      // Set up rejection AFTER hook initialization
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        await result.current.handlers.handleSubmit();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Network error',
        className: 'destructive border-destructive bg-destructive text-destructive-foreground',
      });
    });
  });
});
