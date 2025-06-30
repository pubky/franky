import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useKeypairStore } from './keypair.store';

// Mock Logger
vi.mock('@/libs/logger', () => ({
  Logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
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

describe('KeypairStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});

    // Reset store state
    useKeypairStore.setState({
      publicKey: '',
      secretKey: new Uint8Array(),
      isGenerating: false,
      hasGenerated: false,
      hasHydrated: false,
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useKeypairStore.getState();

      expect(state.publicKey).toBe('');
      expect(state.secretKey).toEqual(new Uint8Array());
      expect(state.isGenerating).toBe(false);
      expect(state.hasGenerated).toBe(false);
      expect(state.hasHydrated).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should clear keys correctly', () => {
      // Set some state
      useKeypairStore.setState({
        publicKey: 'test-key',
        secretKey: new Uint8Array(32).fill(1),
        hasGenerated: true,
        isGenerating: true,
      });

      // Clear keys
      useKeypairStore.getState().clearKeys();

      const state = useKeypairStore.getState();
      expect(state.publicKey).toBe('');
      expect(state.secretKey).toEqual(new Uint8Array());
      expect(state.hasGenerated).toBe(false);
      expect(state.isGenerating).toBe(false);
      expect(state.hasHydrated).toBe(true); // Should remain hydrated
    });

    it('should set generating state', () => {
      const state = useKeypairStore.getState();

      state.setGenerating(true);
      expect(useKeypairStore.getState().isGenerating).toBe(true);

      state.setGenerating(false);
      expect(useKeypairStore.getState().isGenerating).toBe(false);
    });

    it('should set hydrated state', () => {
      const state = useKeypairStore.getState();

      state.setHydrated(true);
      expect(useKeypairStore.getState().hasHydrated).toBe(true);

      state.setHydrated(false);
      expect(useKeypairStore.getState().hasHydrated).toBe(false);
    });
  });

  describe('Key Validation Logic', () => {
    it('should not generate keys if valid keys exist and force is false', () => {
      // Set valid keys manually
      useKeypairStore.setState({
        publicKey: 'existing-key',
        secretKey: new Uint8Array(32).fill(2),
        hasGenerated: true,
        isGenerating: false,
      });

      const initialState = useKeypairStore.getState();

      // Try to generate keys without force
      initialState.generateKeys(false);

      // Keys should remain unchanged (since the logic checks for valid keys first)
      const finalState = useKeypairStore.getState();
      expect(finalState.publicKey).toBe('existing-key');
      expect(finalState.secretKey).toEqual(new Uint8Array(32).fill(2));
    });

    it('should not generate keys if already generating', () => {
      const state = useKeypairStore.getState();

      // Set generating state
      state.setGenerating(true);

      // Try to generate keys
      state.generateKeys();

      // Should remain in generating state without change
      expect(useKeypairStore.getState().isGenerating).toBe(true);
    });
  });

  describe('Integration with Real HomeserverService', () => {
    it('should generate real keys when no valid keys exist', async () => {
      const state = useKeypairStore.getState();

      // Start key generation
      state.generateKeys();

      // Should be in generating state
      expect(useKeypairStore.getState().isGenerating).toBe(true);

      // Wait for the setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      const finalState = useKeypairStore.getState();
      // Check that real keys were generated
      expect(finalState.publicKey).toBeTruthy();
      expect(finalState.publicKey.length).toBeGreaterThan(0);
      expect(finalState.secretKey).toBeInstanceOf(Uint8Array);
      expect(finalState.secretKey.length).toBe(32);
      expect(finalState.hasGenerated).toBe(true);
      expect(finalState.isGenerating).toBe(false);
    });

    it('should force regenerate keys when force is true', async () => {
      // Set existing valid keys
      useKeypairStore.setState({
        publicKey: 'existing-key',
        secretKey: new Uint8Array(32).fill(2),
        hasGenerated: true,
      });

      const initialPublicKey = useKeypairStore.getState().publicKey;

      // Force regenerate keys
      useKeypairStore.getState().generateKeys(true);

      // Wait for the setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      const finalState = useKeypairStore.getState();
      // Keys should be different from the initial ones
      expect(finalState.publicKey).not.toBe(initialPublicKey);
      expect(finalState.publicKey).toBeTruthy();
      expect(finalState.secretKey).toBeInstanceOf(Uint8Array);
      expect(finalState.secretKey.length).toBe(32);
      expect(finalState.hasGenerated).toBe(true);
      expect(finalState.isGenerating).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('should serialize and store keys correctly', () => {
      const testState = {
        publicKey: 'test-public-key',
        secretKey: new Uint8Array([1, 2, 3, 4, 5]),
        hasGenerated: true,
      };

      // Simulate setting state that would trigger persistence
      useKeypairStore.setState(testState);

      // The state should be set correctly
      const state = useKeypairStore.getState();
      expect(state.publicKey).toBe(testState.publicKey);
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
        useKeypairStore.setState({
          publicKey: 'test-key',
          secretKey: new Uint8Array(32),
          hasGenerated: true,
        });
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty secretKey correctly', () => {
      // Set empty secretKey
      useKeypairStore.setState({
        secretKey: new Uint8Array(),
        hasGenerated: false,
      });

      const state = useKeypairStore.getState();
      expect(state.secretKey).toEqual(new Uint8Array());
      expect(state.hasGenerated).toBe(false);
    });

    it('should handle short secretKey correctly', () => {
      // Set short secretKey (less than 32 bytes)
      useKeypairStore.setState({
        secretKey: new Uint8Array(16),
        hasGenerated: false,
      });

      const state = useKeypairStore.getState();
      expect(state.secretKey.length).toBe(16);
      expect(state.hasGenerated).toBe(false);
    });

    it('should handle null secretKey correctly', () => {
      // Set null secretKey
      useKeypairStore.setState({
        secretKey: null as unknown as Uint8Array,
        hasGenerated: false,
      });

      const state = useKeypairStore.getState();
      expect(state.secretKey).toBe(null);
      expect(state.hasGenerated).toBe(false);
    });
  });

  describe('Hydration', () => {
    it('should handle successful hydration', () => {
      const state = useKeypairStore.getState();

      // Simulate successful hydration
      state.setHydrated(true);

      expect(useKeypairStore.getState().hasHydrated).toBe(true);
    });

    it('should handle hydration state changes', () => {
      const state = useKeypairStore.getState();

      // Start not hydrated
      expect(state.hasHydrated).toBe(false);

      // Set hydrated
      state.setHydrated(true);
      expect(useKeypairStore.getState().hasHydrated).toBe(true);

      // Set back to not hydrated
      state.setHydrated(false);
      expect(useKeypairStore.getState().hasHydrated).toBe(false);
    });
  });

  describe('Typical User Flow', () => {
    it('should work with typical user flow', async () => {
      const state = useKeypairStore.getState();

      // 1. Initial state - no keys, not hydrated
      expect(state.hasHydrated).toBe(false);
      expect(state.hasGenerated).toBe(false);

      // 2. Hydration completes
      state.setHydrated(true);
      expect(useKeypairStore.getState().hasHydrated).toBe(true);

      // 3. Generate keys
      state.generateKeys();
      expect(useKeypairStore.getState().isGenerating).toBe(true);

      // 4. Keys generated
      await new Promise((resolve) => setTimeout(resolve, 300));
      const finalState = useKeypairStore.getState();
      expect(finalState.isGenerating).toBe(false);
      expect(finalState.hasGenerated).toBe(true);
      expect(finalState.publicKey).toBeTruthy();
      expect(finalState.secretKey).toBeInstanceOf(Uint8Array);
      expect(finalState.secretKey.length).toBe(32);
    });
  });
});
