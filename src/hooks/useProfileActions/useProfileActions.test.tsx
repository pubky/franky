import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProfileActions } from './useProfileActions';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useCopyToClipboard hook
const mockCopyToClipboard = vi.fn();
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useCopyToClipboard: () => ({
      copyToClipboard: mockCopyToClipboard,
    }),
  };
});

describe('useProfileActions', () => {
  const defaultProps = {
    publicKey: 'pk:test-user-id',
    link: 'https://example.com/profile/test-user-id',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Action handlers', () => {
    it('returns all action handlers', () => {
      const { result } = renderHook(() => useProfileActions(defaultProps));

      expect(result.current.onEdit).toBeDefined();
      expect(result.current.onCopyPublicKey).toBeDefined();
      expect(result.current.onCopyLink).toBeDefined();
      expect(result.current.onSignOut).toBeDefined();
      expect(result.current.onStatusClick).toBeDefined();

      expect(typeof result.current.onEdit).toBe('function');
      expect(typeof result.current.onCopyPublicKey).toBe('function');
      expect(typeof result.current.onCopyLink).toBe('function');
      expect(typeof result.current.onSignOut).toBe('function');
      expect(typeof result.current.onStatusClick).toBe('function');
    });
  });

  describe('onCopyPublicKey', () => {
    it('calls copyToClipboard with public key', () => {
      const { result } = renderHook(() => useProfileActions(defaultProps));

      result.current.onCopyPublicKey();

      expect(mockCopyToClipboard).toHaveBeenCalledWith('pk:test-user-id');
      expect(mockCopyToClipboard).toHaveBeenCalledTimes(1);
    });

    it('uses provided public key from props', () => {
      const customProps = {
        publicKey: 'pk:custom-user',
        link: 'https://example.com/profile/custom-user',
      };

      const { result } = renderHook(() => useProfileActions(customProps));

      result.current.onCopyPublicKey();

      expect(mockCopyToClipboard).toHaveBeenCalledWith('pk:custom-user');
    });

    it('handles empty public key', () => {
      const emptyProps = {
        publicKey: '',
        link: 'https://example.com/profile/test',
      };

      const { result } = renderHook(() => useProfileActions(emptyProps));

      result.current.onCopyPublicKey();

      expect(mockCopyToClipboard).toHaveBeenCalledWith('');
    });
  });

  describe('onCopyLink', () => {
    it('calls copyToClipboard with profile link', () => {
      const { result } = renderHook(() => useProfileActions(defaultProps));

      result.current.onCopyLink();

      expect(mockCopyToClipboard).toHaveBeenCalledWith('https://example.com/profile/test-user-id');
      expect(mockCopyToClipboard).toHaveBeenCalledTimes(1);
    });

    it('uses provided link from props', () => {
      const customProps = {
        publicKey: 'pk:custom-user',
        link: 'https://custom-domain.com/user/custom-user',
      };

      const { result } = renderHook(() => useProfileActions(customProps));

      result.current.onCopyLink();

      expect(mockCopyToClipboard).toHaveBeenCalledWith('https://custom-domain.com/user/custom-user');
    });

    it('handles empty link', () => {
      const emptyProps = {
        publicKey: 'pk:test',
        link: '',
      };

      const { result } = renderHook(() => useProfileActions(emptyProps));

      result.current.onCopyLink();

      expect(mockCopyToClipboard).toHaveBeenCalledWith('');
    });
  });

  describe('onSignOut', () => {
    it('navigates to logout route', () => {
      const { result } = renderHook(() => useProfileActions(defaultProps));

      result.current.onSignOut();

      expect(mockPush).toHaveBeenCalledWith('/logout');
      expect(mockPush).toHaveBeenCalledTimes(1);
    });
  });

  describe('onEdit', () => {
    it('logs to console (not implemented yet)', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const { result } = renderHook(() => useProfileActions(defaultProps));

      result.current.onEdit();

      expect(consoleSpy).toHaveBeenCalledWith('Edit clicked');

      consoleSpy.mockRestore();
    });
  });

  describe('onStatusClick', () => {
    it('logs to console (not implemented yet)', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const { result } = renderHook(() => useProfileActions(defaultProps));

      result.current.onStatusClick();

      expect(consoleSpy).toHaveBeenCalledWith('Status clicked');

      consoleSpy.mockRestore();
    });
  });

  describe('Memoization', () => {
    it('memoizes action handlers based on dependencies', () => {
      const { result, rerender } = renderHook(({ publicKey, link }) => useProfileActions({ publicKey, link }), {
        initialProps: defaultProps,
      });

      const firstOnCopyPublicKey = result.current.onCopyPublicKey;
      const firstOnCopyLink = result.current.onCopyLink;

      // Rerender with same props
      rerender(defaultProps);

      expect(result.current.onCopyPublicKey).toBe(firstOnCopyPublicKey);
      expect(result.current.onCopyLink).toBe(firstOnCopyLink);
    });

    it('updates handlers when publicKey changes', () => {
      const { result, rerender } = renderHook(({ publicKey, link }) => useProfileActions({ publicKey, link }), {
        initialProps: defaultProps,
      });

      const firstOnCopyPublicKey = result.current.onCopyPublicKey;

      // Rerender with different publicKey
      rerender({
        publicKey: 'pk:new-user',
        link: defaultProps.link,
      });

      expect(result.current.onCopyPublicKey).not.toBe(firstOnCopyPublicKey);

      // Call the new handler to verify it uses the new publicKey
      result.current.onCopyPublicKey();
      expect(mockCopyToClipboard).toHaveBeenCalledWith('pk:new-user');
    });

    it('updates handlers when link changes', () => {
      const { result, rerender } = renderHook(({ publicKey, link }) => useProfileActions({ publicKey, link }), {
        initialProps: defaultProps,
      });

      const firstOnCopyLink = result.current.onCopyLink;

      // Rerender with different link
      rerender({
        publicKey: defaultProps.publicKey,
        link: 'https://new-link.com/profile/user',
      });

      expect(result.current.onCopyLink).not.toBe(firstOnCopyLink);

      // Call the new handler to verify it uses the new link
      result.current.onCopyLink();
      expect(mockCopyToClipboard).toHaveBeenCalledWith('https://new-link.com/profile/user');
    });

    it('handlers maintain stability based on their dependencies', () => {
      const { result, rerender } = renderHook(({ publicKey, link }) => useProfileActions({ publicKey, link }), {
        initialProps: defaultProps,
      });

      const firstOnEdit = result.current.onEdit;
      const firstOnStatusClick = result.current.onStatusClick;

      // Rerender with different props
      rerender({
        publicKey: 'pk:new-user',
        link: 'https://new-link.com',
      });

      // onEdit and onStatusClick don't depend on props, so they should remain stable
      expect(result.current.onEdit).toBe(firstOnEdit);
      expect(result.current.onStatusClick).toBe(firstOnStatusClick);
    });
  });

  describe('Multiple calls', () => {
    it('handles multiple onCopyPublicKey calls', () => {
      const { result } = renderHook(() => useProfileActions(defaultProps));

      result.current.onCopyPublicKey();
      result.current.onCopyPublicKey();
      result.current.onCopyPublicKey();

      expect(mockCopyToClipboard).toHaveBeenCalledTimes(3);
      expect(mockCopyToClipboard).toHaveBeenCalledWith('pk:test-user-id');
    });

    it('handles multiple onCopyLink calls', () => {
      const { result } = renderHook(() => useProfileActions(defaultProps));

      result.current.onCopyLink();
      result.current.onCopyLink();

      expect(mockCopyToClipboard).toHaveBeenCalledTimes(2);
      expect(mockCopyToClipboard).toHaveBeenCalledWith('https://example.com/profile/test-user-id');
    });

    it('handles multiple onSignOut calls', () => {
      const { result } = renderHook(() => useProfileActions(defaultProps));

      result.current.onSignOut();
      result.current.onSignOut();

      expect(mockPush).toHaveBeenCalledTimes(2);
      expect(mockPush).toHaveBeenCalledWith('/logout');
    });
  });
});
