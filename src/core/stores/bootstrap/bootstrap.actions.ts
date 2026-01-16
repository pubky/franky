import { BootstrapStore, bootstrapInitialState, BootstrapActionTypes } from './bootstrap.types';
import type { ZustandSet } from '../stores.types';
import * as Libs from '@/libs';

export const createBootstrapActions = (set: ZustandSet<BootstrapStore>) => ({
  setProfileChecked: (value: boolean) =>
    set({ profileChecked: value }, false, BootstrapActionTypes.SET_PROFILE_CHECKED),

  setBootstrapFetched: (value: boolean) =>
    set({ bootstrapFetched: value }, false, BootstrapActionTypes.SET_BOOTSTRAP_FETCHED),

  setDataPersisted: (value: boolean) => set({ dataPersisted: value }, false, BootstrapActionTypes.SET_DATA_PERSISTED),

  setHomeserverSynced: (value: boolean) =>
    set({ homeserverSynced: value }, false, BootstrapActionTypes.SET_HOMESERVER_SYNCED),

  setError: (error: Libs.AppError | null) => set({ error }, false, BootstrapActionTypes.SET_ERROR),

  reset: () => set(bootstrapInitialState, false, BootstrapActionTypes.RESET),
});
