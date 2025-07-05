import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { KeysGuard } from '@/components/guards/keys-guard';
import { useKeypairStore } from '@/core/stores';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock the keypair store
vi.mock('@/core/stores', () => ({
  useKeypairStore: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('KeysGuard', () => {
  const mockPush = vi.fn();
  const mockUseRouter = vi.mocked(useRouter);
  const mockUseKeypairStore = vi.mocked(useKeypairStore);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should render children when keys are valid in memory AND persisted', async () => {
    // Mock valid in-memory state
    mockUseKeypairStore.mockReturnValue({
      secretKey: new Uint8Array(32).fill(1),
      hasGenerated: true,
      hasHydrated: true,
    });

    // Mock valid localStorage
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        state: {
          secretKey: Array.from(new Uint8Array(32).fill(1)),
          hasGenerated: true,
        },
      }),
    );

    render(
      <KeysGuard>
        <div>Protected Content</div>
      </KeysGuard>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should redirect when keys exist in memory but NOT in localStorage (manual deletion scenario)', async () => {
    // Mock valid in-memory state (keys were generated)
    mockUseKeypairStore.mockReturnValue({
      secretKey: new Uint8Array(32).fill(1),
      hasGenerated: true,
      hasHydrated: true,
    });

    // Mock empty localStorage (manually cleared)
    localStorageMock.getItem.mockReturnValue(null);

    render(
      <KeysGuard>
        <div>Protected Content</div>
      </KeysGuard>,
    );

    // Should redirect to onboarding
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });

    // Should not render protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect when localStorage has keys but memory state is invalid', async () => {
    // Mock invalid in-memory state
    mockUseKeypairStore.mockReturnValue({
      secretKey: new Uint8Array(), // Empty array
      hasGenerated: false,
      hasHydrated: true,
    });

    // Mock valid localStorage
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        state: {
          secretKey: Array.from(new Uint8Array(32).fill(1)),
          hasGenerated: true,
        },
      }),
    );

    render(
      <KeysGuard>
        <div>Protected Content</div>
      </KeysGuard>,
    );

    // Should redirect to onboarding
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should not render anything while hydrating', () => {
    // Mock not hydrated state
    mockUseKeypairStore.mockReturnValue({
      secretKey: new Uint8Array(32).fill(1),
      hasGenerated: true,
      hasHydrated: false, // Still hydrating
    });

    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        state: {
          secretKey: Array.from(new Uint8Array(32).fill(1)),
          hasGenerated: true,
        },
      }),
    );

    render(
      <KeysGuard>
        <div>Protected Content</div>
      </KeysGuard>,
    );

    // Should not render content while hydrating
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // Should not redirect while hydrating
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle corrupted localStorage gracefully', async () => {
    // Mock valid in-memory state
    mockUseKeypairStore.mockReturnValue({
      secretKey: new Uint8Array(32).fill(1),
      hasGenerated: true,
      hasHydrated: true,
    });

    // Mock corrupted localStorage
    localStorageMock.getItem.mockReturnValue('invalid-json');

    render(
      <KeysGuard>
        <div>Protected Content</div>
      </KeysGuard>,
    );

    // Should redirect due to corrupted localStorage
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should use custom fallback route', async () => {
    // Mock invalid state
    mockUseKeypairStore.mockReturnValue({
      secretKey: new Uint8Array(),
      hasGenerated: false,
      hasHydrated: true,
    });

    localStorageMock.getItem.mockReturnValue(null);

    render(
      <KeysGuard fallbackRoute="/custom-route">
        <div>Protected Content</div>
      </KeysGuard>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-route');
    });
  });

  it('should allow access when requireKeys is false', () => {
    // Mock invalid state
    mockUseKeypairStore.mockReturnValue({
      secretKey: new Uint8Array(),
      hasGenerated: false,
      hasHydrated: true,
    });

    localStorageMock.getItem.mockReturnValue(null);

    render(
      <KeysGuard requireKeys={false}>
        <div>Protected Content</div>
      </KeysGuard>,
    );

    // Should render content even with invalid keys
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle the case where localStorage gets repopulated after being cleared', async () => {
    // Mock valid in-memory state
    mockUseKeypairStore.mockReturnValue({
      secretKey: new Uint8Array(32).fill(1),
      hasGenerated: true,
      hasHydrated: true,
    });

    // Initially localStorage is empty (was cleared)
    localStorageMock.getItem.mockReturnValueOnce(null);

    render(
      <KeysGuard>
        <div>Protected Content</div>
      </KeysGuard>,
    );

    // Should initially redirect due to missing localStorage
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });

    // But if localStorage gets repopulated (by keys page), it should work
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        state: {
          secretKey: Array.from(new Uint8Array(32).fill(1)),
          hasGenerated: true,
        },
      }),
    );

    // Re-render with the same state but now localStorage is populated
    render(
      <KeysGuard>
        <div>Protected Content</div>
      </KeysGuard>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
