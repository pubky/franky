import { describe, it, expect, beforeEach } from 'vitest';
import { useBootstrapStore } from './bootstrap.store';
import * as Libs from '@/libs';

describe('BootstrapStore', () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    useBootstrapStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have all flags set to false initially', () => {
      const state = useBootstrapStore.getState();

      expect(state.profileChecked).toBe(false);
      expect(state.bootstrapFetched).toBe(false);
      expect(state.dataPersisted).toBe(false);
      expect(state.homeserverSynced).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Step Actions', () => {
    it('should set profileChecked to true', () => {
      useBootstrapStore.getState().setProfileChecked(true);
      expect(useBootstrapStore.getState().profileChecked).toBe(true);
    });

    it('should set bootstrapFetched to true', () => {
      useBootstrapStore.getState().setBootstrapFetched(true);
      expect(useBootstrapStore.getState().bootstrapFetched).toBe(true);
    });

    it('should set dataPersisted to true', () => {
      useBootstrapStore.getState().setDataPersisted(true);
      expect(useBootstrapStore.getState().dataPersisted).toBe(true);
    });

    it('should set homeserverSynced to true', () => {
      useBootstrapStore.getState().setHomeserverSynced(true);
      expect(useBootstrapStore.getState().homeserverSynced).toBe(true);
    });

    it('should track progress through all steps', () => {
      const store = useBootstrapStore.getState();

      store.setProfileChecked(true);
      expect(useBootstrapStore.getState().profileChecked).toBe(true);

      store.setBootstrapFetched(true);
      expect(useBootstrapStore.getState().bootstrapFetched).toBe(true);

      store.setDataPersisted(true);
      expect(useBootstrapStore.getState().dataPersisted).toBe(true);

      store.setHomeserverSynced(true);
      expect(useBootstrapStore.getState().homeserverSynced).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should set error state', () => {
      const mockError = new Libs.AppError(Libs.CommonErrorType.NETWORK_ERROR, 'Network failed', 500);

      useBootstrapStore.getState().setError(mockError);

      expect(useBootstrapStore.getState().error).toBe(mockError);
    });

    it('should clear error state', () => {
      const mockError = new Libs.AppError(Libs.CommonErrorType.NETWORK_ERROR, 'Network failed', 500);

      useBootstrapStore.getState().setError(mockError);
      useBootstrapStore.getState().setError(null);

      expect(useBootstrapStore.getState().error).toBeNull();
    });
  });

  describe('Reset', () => {
    it('should reset all state to initial values', () => {
      const store = useBootstrapStore.getState();
      const mockError = new Libs.AppError(Libs.CommonErrorType.NETWORK_ERROR, 'Network failed', 500);

      // Set all state
      store.setProfileChecked(true);
      store.setBootstrapFetched(true);
      store.setDataPersisted(true);
      store.setHomeserverSynced(true);
      store.setError(mockError);

      // Reset
      store.reset();

      // Verify all reset
      const resetState = useBootstrapStore.getState();
      expect(resetState.profileChecked).toBe(false);
      expect(resetState.bootstrapFetched).toBe(false);
      expect(resetState.dataPersisted).toBe(false);
      expect(resetState.homeserverSynced).toBe(false);
      expect(resetState.error).toBeNull();
    });
  });
});
