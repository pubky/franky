import * as Libs from '@/libs';

export interface BootstrapState {
  /** Profile check completed (25%) */
  profileChecked: boolean;
  /** Bootstrap data fetched from Nexus (50%) */
  bootstrapFetched: boolean;
  /** Data persisted to IndexedDB (75%) */
  dataPersisted: boolean;
  /** Homeserver data synced: last_read, settings */
  homeserverSynced: boolean;
  /** Error that occurred during bootstrap, if any */
  error: Libs.AppError | null;
}

export interface BootstrapActions {
  setProfileChecked: (value: boolean) => void;
  setBootstrapFetched: (value: boolean) => void;
  setDataPersisted: (value: boolean) => void;
  setHomeserverSynced: (value: boolean) => void;
  setError: (error: Libs.AppError | null) => void;
  reset: () => void;
}

export type BootstrapStore = BootstrapState & BootstrapActions;

export const bootstrapInitialState: BootstrapState = {
  profileChecked: false,
  bootstrapFetched: false,
  dataPersisted: false,
  homeserverSynced: false,
  error: null,
};

export enum BootstrapActionTypes {
  SET_PROFILE_CHECKED = 'SET_PROFILE_CHECKED',
  SET_BOOTSTRAP_FETCHED = 'SET_BOOTSTRAP_FETCHED',
  SET_DATA_PERSISTED = 'SET_DATA_PERSISTED',
  SET_HOMESERVER_SYNCED = 'SET_HOMESERVER_SYNCED',
  SET_ERROR = 'SET_ERROR',
  RESET = 'RESET',
}
