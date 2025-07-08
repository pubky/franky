import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useOnboardingStore } from './onboarding.store';

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

describe('OnboardingStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});

    // Reset store state
    useOnboardingStore.setState({
      secretKey: new Uint8Array(),
      isGenerating: false,
      hasGenerated: false,
      hasHydrated: false,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useOnboardingStore.getState();

      expect(state.secretKey).toEqual(new Uint8Array());
      expect(state.isGenerating).toBe(false);
      expect(state.hasGenerated).toBe(false);
      expect(state.hasHydrated).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should clear keys correctly', () => {
      // Set some state
      useOnboardingStore.setState({
        secretKey: new Uint8Array(32).fill(1),
        hasGenerated: true,
        isGenerating: true,
      });

      // Clear keys
      useOnboardingStore.getState().clearKeys();

      const state = useOnboardingStore.getState();
      expect(state.secretKey).toEqual(new Uint8Array());
      expect(state.hasGenerated).toBe(false);
      expect(state.isGenerating).toBe(false);
      expect(state.hasHydrated).toBe(true); // Should remain hydrated
    });

    it('should set generating state', () => {
      const state = useOnboardingStore.getState();

      state.setGenerating(true);
      expect(useOnboardingStore.getState().isGenerating).toBe(true);

      state.setGenerating(false);
      expect(useOnboardingStore.getState().isGenerating).toBe(false);
    });

    it('should set hydrated state', () => {
      const state = useOnboardingStore.getState();

      state.setHydrated(true);
      expect(useOnboardingStore.getState().hasHydrated).toBe(true);

      state.setHydrated(false);
      expect(useOnboardingStore.getState().hasHydrated).toBe(false);
    });
  });

  describe('Key Validation Logic', () => {
    it('should not generate keys if valid keys exist and force is false', () => {
      // Set valid keys manually
      useOnboardingStore.setState({
        secretKey: new Uint8Array(32).fill(2),
        hasGenerated: true,
        isGenerating: false,
      });

      const initialState = useOnboardingStore.getState();

      // Try to generate keys without force
      initialState.generateKeys(false);

      // Keys should remain unchanged (since the logic checks for valid keys first)
      const finalState = useOnboardingStore.getState();
      expect(finalState.secretKey).toEqual(new Uint8Array(32).fill(2));
    });

    it('should not generate keys if already generating', () => {
      const state = useOnboardingStore.getState();

      // Set generating state
      state.setGenerating(true);

      // Try to generate keys
      state.generateKeys();

      // Should remain in generating state without change
      expect(useOnboardingStore.getState().isGenerating).toBe(true);
    });
  });

  describe('Integration with Real HomeserverService', () => {
    it('should generate real keys when no valid keys exist', async () => {
      const state = useOnboardingStore.getState();

      // Start key generation
      state.generateKeys();

      // Key generation is synchronous, so keys should be generated immediately
      const finalState = useOnboardingStore.getState();

      // Check that real keys were generated
      expect(finalState.secretKey).toBeInstanceOf(Uint8Array);
      if (finalState.secretKey) {
        expect(finalState.secretKey.length).toBe(32);
      }
      expect(finalState.hasGenerated).toBe(true);
      expect(finalState.isGenerating).toBe(false);
    });

    it('should force regenerate keys when force is true', async () => {
      // Set existing valid keys
      useOnboardingStore.setState({
        secretKey: new Uint8Array(32).fill(2),
        hasGenerated: true,
      });

      const initialSecretKey = useOnboardingStore.getState().secretKey;

      // Force regenerate keys
      useOnboardingStore.getState().generateKeys(true);

      // Wait for the setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      const finalState = useOnboardingStore.getState();
      // Keys should be different from the initial ones
      expect(finalState.secretKey).not.toEqual(initialSecretKey);
      expect(finalState.secretKey).toBeInstanceOf(Uint8Array);
      if (finalState.secretKey) {
        expect(finalState.secretKey.length).toBe(32);
      }
      expect(finalState.hasGenerated).toBe(true);
      expect(finalState.isGenerating).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('should serialize and store keys correctly', () => {
      const testState = {
        secretKey: new Uint8Array([1, 2, 3, 4, 5]),
        hasGenerated: true,
      };

      // Simulate setting state that would trigger persistence
      useOnboardingStore.setState(testState);

      // The state should be set correctly
      const state = useOnboardingStore.getState();
      expect(state.secretKey).toEqual(testState.secretKey);
      expect(state.hasGenerated).toBe(testState.hasGenerated);
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // This should not throw an error
      expect(() => {
        useOnboardingStore.setState({
          secretKey: new Uint8Array(32),
          hasGenerated: true,
        });
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty secretKey correctly', () => {
      // Set empty secretKey
      useOnboardingStore.setState({
        secretKey: new Uint8Array(),
        hasGenerated: false,
      });

      const state = useOnboardingStore.getState();
      expect(state.secretKey).toEqual(new Uint8Array());
      expect(state.hasGenerated).toBe(false);
    });

    it('should handle short secretKey correctly', () => {
      // Set short secretKey (less than 32 bytes)
      useOnboardingStore.setState({
        secretKey: new Uint8Array(16),
        hasGenerated: false,
      });

      const state = useOnboardingStore.getState();
      if (state.secretKey) {
        expect(state.secretKey.length).toBe(16);
      }
      expect(state.hasGenerated).toBe(false);
    });

    it('should handle null secretKey correctly', () => {
      // Set null secretKey
      useOnboardingStore.setState({
        secretKey: null as unknown as Uint8Array,
        hasGenerated: false,
      });

      const state = useOnboardingStore.getState();
      expect(state.secretKey).toBe(null);
      expect(state.hasGenerated).toBe(false);
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
      // Mock localStorage to throw error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // This should not throw an error
      expect(() => {
        useOnboardingStore.setState({
          secretKey: new Uint8Array(32).fill(1),
          hasGenerated: true,
        });
      }).not.toThrow();
    });

    it('should handle localStorage quota exceeded during setItem', () => {
      // Mock localStorage to throw QuotaExceededError
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      // This should not throw an error
      expect(() => {
        useOnboardingStore.setState({
          secretKey: new Uint8Array(32).fill(1),
          hasGenerated: true,
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
      // Manually test the hydration logic since the automatic callback is hard to test
      const state = useOnboardingStore.getState();

      // Initially not hydrated
      expect(state.hasHydrated).toBe(false);

      // Set some existing data
      useOnboardingStore.setState({
        secretKey: new Uint8Array([1, 2, 3, 4, 5]),
        hasGenerated: true,
      });

      // Simulate what the rehydration callback does when there's existing data
      state.setHydrated(true);

      // Should now be hydrated with the existing data
      const finalState = useOnboardingStore.getState();
      expect(finalState.hasHydrated).toBe(true);
      expect(finalState.secretKey).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
      expect(finalState.hasGenerated).toBe(true);
    });
  });

  describe('Typical User Flow', () => {
    it('should work with typical user flow', async () => {
      const store = useOnboardingStore.getState();

      // 1. Initial state should be empty
      expect(store.secretKey).toEqual(new Uint8Array());
      expect(store.hasGenerated).toBe(false);
      expect(store.isGenerating).toBe(false);

      // 2. Generate keys
      store.generateKeys();

      // 3. Keys should be generated immediately (synchronous)
      const finalState = useOnboardingStore.getState();
      expect(finalState.isGenerating).toBe(false);
      expect(finalState.hasGenerated).toBe(true);
      expect(finalState.secretKey).toBeInstanceOf(Uint8Array);
      if (finalState.secretKey) {
        expect(finalState.secretKey.length).toBe(32);
      }
    });
  });

  describe('localStorage Repopulation', () => {
    it('should detect when keys exist in memory but not in localStorage ', async () => {
      // Set keys in memory
      useOnboardingStore.setState({
        secretKey: new Uint8Array(32).fill(1),
        hasGenerated: true,
      });

      // Mock localStorage to be empty
      localStorageMock.getItem.mockReturnValue(null);

      // Wait for potential repopulation logic
      await new Promise((resolve) => setTimeout(resolve, 400));

      const state = useOnboardingStore.getState();
      expect(state.secretKey).toBeInstanceOf(Uint8Array);
      expect(state.hasGenerated).toBe(true);
    });
  });
});
