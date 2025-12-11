import type { STORAGE_KEYS, STORAGE_DEFAULTS } from './storage.constants';

/**
 * Valid storage key types
 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Storage key with known default value
 */
export type StorageKeyWithDefault = keyof typeof STORAGE_DEFAULTS;
