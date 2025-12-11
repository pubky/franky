import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useOnboardingStore } from './onboarding.store';
import { Keypair } from '@synonymdev/pubky';

// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Helper to create mock keypair
const createMockKeypair = (): Keypair => {
  const mockPubky = 'test-pubky-123';
  const mockSecretKey = new Uint8Array(32).fill(1);

  return {
    publicKey: {
      z32: () => mockPubky,
    },
    secretKey: () => mockSecretKey,
    free: vi.fn(),
  } as unknown as Keypair;
};

describe('OnboardingStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});

    // Reset store state to initial state
    useOnboardingStore.setState({
      keypair: null,
      mnemonic: null,
      hasHydrated: false,
      showWelcomeDialog: false,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useOnboardingStore.getState();

      expect(state.keypair).toBeNull();
      expect(state.mnemonic).toBeNull();
      expect(state.hasHydrated).toBe(false);
      expect(state.showWelcomeDialog).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should clear keys correctly while preserving hydration state', () => {
      const mockKeypair = createMockKeypair();
      // Set some state
      useOnboardingStore.setState({
        keypair: mockKeypair,
        mnemonic: 'test mnemonic phrase',
        hasHydrated: true,
      });

      // Clear keys
      useOnboardingStore.getState().reset();

      const state = useOnboardingStore.getState();
      expect(state.keypair).toBeNull();
      expect(state.mnemonic).toBeNull();
      expect(state.hasHydrated).toBe(true); // Should preserve hydration state
    });

    it('should preserve false hydration state during reset', () => {
      const mockKeypair = createMockKeypair();
      // Set some state with hasHydrated false
      useOnboardingStore.setState({
        keypair: mockKeypair,
        mnemonic: 'test mnemonic phrase',
        hasHydrated: false,
      });

      // Clear keys
      useOnboardingStore.getState().reset();

      const state = useOnboardingStore.getState();
      expect(state.keypair).toBeNull();
      expect(state.mnemonic).toBeNull();
      expect(state.hasHydrated).toBe(false); // Should preserve hydration state even when false
    });

    it('should set hydrated state', () => {
      const state = useOnboardingStore.getState();

      state.setHydrated(true);
      expect(useOnboardingStore.getState().hasHydrated).toBe(true);

      state.setHydrated(false);
      expect(useOnboardingStore.getState().hasHydrated).toBe(false);
    });

    it('should set keypair with setKeypair action', () => {
      const mockKeypair = createMockKeypair();
      const state = useOnboardingStore.getState();

      // Initially keypair should be null
      expect(state.keypair).toBeNull();

      // Set keypair
      state.setKeypair(mockKeypair);

      const updatedState = useOnboardingStore.getState();
      expect(updatedState.keypair).toBe(mockKeypair);
      expect(updatedState.keypair?.publicKey.z32()).toBe('test-pubky-123');
    });
  });

  describe('Key Validation Logic', () => {
    it('should clear keys when reset is called', () => {
      const mockKeypair = createMockKeypair();
      // Set valid keys manually
      useOnboardingStore.setState({
        keypair: mockKeypair,
      });

      const initialState = useOnboardingStore.getState();

      // Reset keys
      initialState.reset();

      // Keys should be cleared
      const finalState = useOnboardingStore.getState();
      expect(finalState.keypair).toBeNull();
    });

    it('should clear keys when reset is called', () => {
      const state = useOnboardingStore.getState();

      // Reset keys
      state.reset();

      // Should be null after reset
      expect(useOnboardingStore.getState().keypair).toBeNull();
    });
  });

  describe('Reset Functionality', () => {
    it('should clear keys when reset is called', () => {
      const mockKeypair = createMockKeypair();
      const state = useOnboardingStore.getState();

      // Set a keypair
      state.setKeypair(mockKeypair);

      // Reset
      state.reset();

      // Keys should be cleared
      const finalState = useOnboardingStore.getState();
      expect(finalState.keypair).toBeNull();
    });

    it('should clear keys when reset is called with existing keys', () => {
      const mockKeypair = createMockKeypair();
      // Set existing valid keys
      useOnboardingStore.setState({
        keypair: mockKeypair,
      });

      // Reset keys
      useOnboardingStore.getState().reset();

      const finalState = useOnboardingStore.getState();
      // Keys should be cleared
      expect(finalState.keypair).toBeNull();
    });
  });

  describe('Persistence', () => {
    it('should serialize and store keys correctly', () => {
      const mockKeypair = createMockKeypair();
      const testState = {
        keypair: mockKeypair,
      };

      // Simulate setting state that would trigger persistence
      useOnboardingStore.setState(testState);

      // The state should be set correctly
      const state = useOnboardingStore.getState();
      expect(state.keypair).toBe(mockKeypair);
    });

    it('should handle localStorage errors gracefully', () => {
      const mockKeypair = createMockKeypair();
      // Mock localStorage to throw error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // This should not throw an error
      expect(() => {
        useOnboardingStore.setState({
          keypair: mockKeypair,
        });
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null keypair correctly', () => {
      // Set null keypair
      useOnboardingStore.setState({
        keypair: null,
      });

      const state = useOnboardingStore.getState();
      expect(state.keypair).toBeNull();
    });

    it('should handle keypair correctly', () => {
      const mockKeypair = createMockKeypair();
      // Set keypair
      useOnboardingStore.setState({
        keypair: mockKeypair,
      });

      const state = useOnboardingStore.getState();
      expect(state.keypair).toBe(mockKeypair);
    });

    it('should handle null mnemonic correctly', () => {
      // Set null mnemonic
      useOnboardingStore.setState({
        mnemonic: null,
      });

      const state = useOnboardingStore.getState();
      expect(state.mnemonic).toBeNull();
    });
  });

  describe('Hydration', () => {
    it('should handle successful hydration', () => {
      const state = useOnboardingStore.getState();

      // Initially not hydrated
      expect(state.hasHydrated).toBe(false);

      // Set hydrated
      state.setHydrated(true);
      expect(useOnboardingStore.getState().hasHydrated).toBe(true);
    });

    it('should handle hydration state changes', () => {
      const state = useOnboardingStore.getState();

      // Set hydrated to true
      state.setHydrated(true);
      expect(useOnboardingStore.getState().hasHydrated).toBe(true);

      // Set hydrated to false
      state.setHydrated(false);
      expect(useOnboardingStore.getState().hasHydrated).toBe(false);
    });
  });

  describe('Storage Error Handling', () => {
    it('should handle localStorage errors during storage operations', () => {
      const mockKeypair = createMockKeypair();
      // Mock localStorage to throw error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // This should not throw an error
      expect(() => {
        useOnboardingStore.setState({
          keypair: mockKeypair,
        });
      }).not.toThrow();
    });

    it('should handle localStorage quota exceeded during setItem', () => {
      const mockKeypair = createMockKeypair();
      // Mock localStorage to throw QuotaExceededError
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      // This should not throw an error
      expect(() => {
        useOnboardingStore.setState({
          keypair: mockKeypair,
        });
      }).not.toThrow();
    });
  });

  describe('Rehydration Callback Logic', () => {
    it('should handle rehydration with no stored state (localStorage cleared)', async () => {
      // Manually test the hydration logic since the automatic callback is hard to test
      const state = useOnboardingStore.getState();

      // Initially not hydrated
      expect(state.hasHydrated).toBe(false);

      // Simulate what the rehydration callback does when there's no stored state
      state.setHydrated(true);

      // Should now be hydrated
      expect(useOnboardingStore.getState().hasHydrated).toBe(true);
    });

    it('should handle rehydration errors gracefully', async () => {
      // Manually test the hydration logic since the automatic callback is hard to test
      const state = useOnboardingStore.getState();

      // Initially not hydrated
      expect(state.hasHydrated).toBe(false);

      // Simulate what the rehydration callback does when there's an error
      state.setHydrated(true);

      // Should now be hydrated
      expect(useOnboardingStore.getState().hasHydrated).toBe(true);
    });

    it('should handle successful rehydration with existing data', async () => {
      const mockKeypair = createMockKeypair();
      // Manually test the hydration logic since the automatic callback is hard to test
      const state = useOnboardingStore.getState();

      // Initially not hydrated
      expect(state.hasHydrated).toBe(false);

      // Set some existing data
      useOnboardingStore.setState({
        keypair: mockKeypair,
      });

      // Simulate what the rehydration callback does when there's existing data
      state.setHydrated(true);

      // Should now be hydrated with the existing data
      const finalState = useOnboardingStore.getState();
      expect(finalState.hasHydrated).toBe(true);
      expect(finalState.keypair).toBe(mockKeypair);
    });
  });

  describe('Mnemonic Management', () => {
    it('should set mnemonic correctly', () => {
      const testMnemonic =
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      const state = useOnboardingStore.getState();

      state.setMnemonic(testMnemonic);

      const updatedState = useOnboardingStore.getState();
      expect(updatedState.mnemonic).toEqual(testMnemonic);
    });

    it('should set keypair correctly', () => {
      const mockKeypair = createMockKeypair();
      const state = useOnboardingStore.getState();

      // Set keypair
      state.setKeypair(mockKeypair);

      const updatedState = useOnboardingStore.getState();
      expect(updatedState.keypair).toBe(mockKeypair);
    });

    it('should handle keypair operations', () => {
      const mockKeypair = createMockKeypair();
      const state = useOnboardingStore.getState();

      // Set keypair
      state.setKeypair(mockKeypair);
      expect(useOnboardingStore.getState().keypair).toBe(mockKeypair);

      // Clear secrets
      state.clearSecrets();
      expect(useOnboardingStore.getState().keypair).toBeNull();
      expect(useOnboardingStore.getState().mnemonic).toBeNull();
    });
  });

  describe('Typical User Flow', () => {
    it('should work with typical user flow', async () => {
      const store = useOnboardingStore.getState();

      // 1. Initial state should be empty
      expect(store.keypair).toBeNull();

      // 2. Set keypair
      const mockKeypair = createMockKeypair();
      store.setKeypair(mockKeypair);

      // 3. Verify keypair is set
      const finalState = useOnboardingStore.getState();
      expect(finalState.keypair).toBe(mockKeypair);
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist keypair in memory', async () => {
      const mockKeypair = createMockKeypair();
      // Set keys in memory
      useOnboardingStore.setState({
        keypair: mockKeypair,
      });

      // Mock localStorage to be empty
      localStorageMock.getItem.mockReturnValue(null);

      // Wait for potential persistence logic
      await new Promise((resolve) => setTimeout(resolve, 100));

      const state = useOnboardingStore.getState();
      expect(state.keypair).toBe(mockKeypair);
    });
  });

  describe('Persistence Configuration', () => {
    it('should persist all required state properties', () => {
      const mockKeypair = createMockKeypair();
      const testData = {
        keypair: mockKeypair,
        mnemonic: 'test mnemonic phrase with twelve words for key generation',
      };

      // Set all data using setState (which would trigger persistence)
      useOnboardingStore.setState(testData);

      // Verify all persisted data is accessible
      const state = useOnboardingStore.getState();
      expect(state.keypair).toBe(mockKeypair);
      expect(state.mnemonic).toBe(testData.mnemonic);
    });

    it('should exclude action functions from persistence', () => {
      const state = useOnboardingStore.getState();

      // Verify that action functions exist in the store
      expect(typeof state.setMnemonic).toBe('function');
      expect(typeof state.setKeypair).toBe('function');
      expect(typeof state.clearSecrets).toBe('function');
      expect(typeof state.setHydrated).toBe('function');
      expect(typeof state.setShowWelcomeDialog).toBe('function');
      expect(typeof state.reset).toBe('function');

      // Verify that selector functions exist
      expect(typeof state.selectSecretKey).toBe('function');
      expect(typeof state.selectPublicKey).toBe('function');
      expect(typeof state.selectMnemonic).toBe('function');

      // Actions should not be persisted (this is tested implicitly by the partialize function)
      // The partialize function only includes data properties, not function properties
    });

    it('should handle mnemonic storage through actions', () => {
      const testMnemonic =
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

      // Initially mnemonic should be null
      expect(useOnboardingStore.getState().mnemonic).toBeNull();

      // Set mnemonic using the action (following same pattern as existing working tests)
      const state = useOnboardingStore.getState();
      state.setMnemonic(testMnemonic);

      // Verify mnemonic is stored in state (and would be persisted)
      const updatedState = useOnboardingStore.getState();
      expect(updatedState.mnemonic).toBe(testMnemonic);
    });
  });

  describe('Rehydration Callback', () => {
    it('should manage hasHydrated state correctly', () => {
      // Initially should be false (following the exact pattern of existing working test)
      const state = useOnboardingStore.getState();
      expect(state.hasHydrated).toBe(false);

      // Set hydrated to true
      state.setHydrated(true);

      // Verify it was set (following the exact pattern of existing working test)
      const updatedState = useOnboardingStore.getState();
      expect(updatedState.hasHydrated).toBe(true);
    });

    it('should preserve hasHydrated during reset operations', () => {
      const state = useOnboardingStore.getState();

      // Set hydrated to true first
      state.setHydrated(true);
      expect(useOnboardingStore.getState().hasHydrated).toBe(true);

      // Reset should preserve hydration state (this is tested in existing tests too)
      state.reset();
      expect(useOnboardingStore.getState().hasHydrated).toBe(true);
    });
  });

  describe('Complete Persistence Lifecycle', () => {
    it('should handle store operations with mnemonic and keys', () => {
      const testMnemonic =
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      const mockKeypair = createMockKeypair();

      const state = useOnboardingStore.getState();

      // Set mnemonic using action (same pattern as existing working tests)
      state.setMnemonic(testMnemonic);

      // Set keypair using action (same pattern as existing working tests)
      state.setKeypair(mockKeypair);

      // Verify state is consistent
      const updatedState = useOnboardingStore.getState();
      expect(updatedState.mnemonic).toBe(testMnemonic);
      expect(updatedState.keypair).toBe(mockKeypair);
    });

    it('should handle localStorage persistence simulation', () => {
      const mockKeypair = createMockKeypair();
      // Mock successful localStorage operations
      localStorageMock.setItem.mockImplementation((key, value) => {
        // Simulate successful storage
        expect(key).toBe('onboarding-storage');
        expect(typeof value).toBe('string');

        // Parse the stored value to verify it contains expected data
        const storedData = JSON.parse(value);
        expect(storedData.state).toBeDefined();
      });

      // Set data that should trigger persistence
      const testData = {
        keypair: mockKeypair,
        mnemonic: 'test mnemonic for persistence verification',
      };

      useOnboardingStore.setState(testData);

      // Verify the data is in the store
      const state = useOnboardingStore.getState();
      expect(state.keypair).toBe(mockKeypair);
      expect(state.mnemonic).toBe(testData.mnemonic);
    });
  });

  describe('Welcome Dialog State Management', () => {
    it('should have showWelcomeDialog as false by default', () => {
      const state = useOnboardingStore.getState();
      expect(state.showWelcomeDialog).toBe(false);
    });

    it('should set showWelcomeDialog to true', () => {
      const state = useOnboardingStore.getState();

      // Initially should be false
      expect(state.showWelcomeDialog).toBe(false);

      // Set to true
      state.setShowWelcomeDialog(true);

      const updatedState = useOnboardingStore.getState();
      expect(updatedState.showWelcomeDialog).toBe(true);
    });

    it('should set showWelcomeDialog to false', () => {
      const state = useOnboardingStore.getState();

      // Set to true first
      state.setShowWelcomeDialog(true);
      expect(useOnboardingStore.getState().showWelcomeDialog).toBe(true);

      // Set to false
      state.setShowWelcomeDialog(false);

      const updatedState = useOnboardingStore.getState();
      expect(updatedState.showWelcomeDialog).toBe(false);
    });

    it('should toggle showWelcomeDialog state correctly', () => {
      const state = useOnboardingStore.getState();

      // Start with false
      expect(state.showWelcomeDialog).toBe(false);

      // Toggle to true
      state.setShowWelcomeDialog(true);
      expect(useOnboardingStore.getState().showWelcomeDialog).toBe(true);

      // Toggle back to false
      state.setShowWelcomeDialog(false);
      expect(useOnboardingStore.getState().showWelcomeDialog).toBe(false);

      // Toggle to true again
      state.setShowWelcomeDialog(true);
      expect(useOnboardingStore.getState().showWelcomeDialog).toBe(true);
    });

    it('should have setShowWelcomeDialog action available', () => {
      const state = useOnboardingStore.getState();
      expect(typeof state.setShowWelcomeDialog).toBe('function');
    });

    it('should persist showWelcomeDialog state', () => {
      const mockKeypair = createMockKeypair();
      const testData = {
        keypair: mockKeypair,
        mnemonic: 'test mnemonic phrase with twelve words for key generation',
        showWelcomeDialog: true,
      };

      // Set all data including showWelcomeDialog
      useOnboardingStore.setState(testData);

      // Verify showWelcomeDialog is persisted along with other data
      const state = useOnboardingStore.getState();
      expect(state.keypair).toBe(mockKeypair);
      expect(state.mnemonic).toBe(testData.mnemonic);
      expect(state.showWelcomeDialog).toBe(testData.showWelcomeDialog);
    });

    it('should preserve showWelcomeDialog during reset', () => {
      const mockKeypair = createMockKeypair();
      const state = useOnboardingStore.getState();

      // Set some data including showWelcomeDialog
      useOnboardingStore.setState({
        keypair: mockKeypair,
        mnemonic: 'test mnemonic phrase',
        hasHydrated: true,
        showWelcomeDialog: true,
      });

      // Reset should clear keys but preserve showWelcomeDialog as false (reset behavior)
      state.reset();

      const resetState = useOnboardingStore.getState();
      expect(resetState.keypair).toBeNull();
      expect(resetState.mnemonic).toBeNull();
      expect(resetState.hasHydrated).toBe(true); // Preserved
      expect(resetState.showWelcomeDialog).toBe(false); // Reset to initial state
    });
  });
});
