import { STORAGE_KEYS, STORAGE_DEFAULTS } from './storage.constants';
import type { StorageKey, StorageKeyWithDefault } from './storage.types';

/**
 * Checks if localStorage is available (handles SSR)
 */
function isStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Gets a boolean value from localStorage
 * @param key - The storage key
 * @param defaultValue - Default value if not found (defaults to true)
 * @returns The stored boolean value or default
 *
 * @example
 * Libs.getStorageBoolean(Libs.STORAGE_KEYS.CHECK_LINK)
 * // => true (default)
 *
 * @example
 * Libs.getStorageBoolean(Libs.STORAGE_KEYS.CHECK_LINK, false)
 * // => false (custom default)
 */
export function getStorageBoolean(key: StorageKeyWithDefault): boolean;
export function getStorageBoolean(key: StorageKey, defaultValue: boolean): boolean;
export function getStorageBoolean(key: StorageKey, defaultValue?: boolean): boolean {
  if (!isStorageAvailable()) {
    return defaultValue ?? STORAGE_DEFAULTS[key as StorageKeyWithDefault] ?? true;
  }

  const saved = localStorage.getItem(key);
  if (saved === null) {
    return defaultValue ?? STORAGE_DEFAULTS[key as StorageKeyWithDefault] ?? true;
  }

  return saved === 'true';
}

/**
 * Sets a boolean value in localStorage
 * @param key - The storage key
 * @param value - The boolean value to store
 *
 * @example
 * Libs.setStorageBoolean(Libs.STORAGE_KEYS.CHECK_LINK, false)
 */
export function setStorageBoolean(key: StorageKey, value: boolean): void {
  if (!isStorageAvailable()) {
    return;
  }

  localStorage.setItem(key, String(value));
}

/**
 * Gets a string value from localStorage
 * @param key - The storage key
 * @param defaultValue - Default value if not found
 * @returns The stored string value or default
 */
export function getStorageString(key: StorageKey, defaultValue: string = ''): string {
  if (!isStorageAvailable()) {
    return defaultValue;
  }

  return localStorage.getItem(key) ?? defaultValue;
}

/**
 * Sets a string value in localStorage
 * @param key - The storage key
 * @param value - The string value to store
 */
export function setStorageString(key: StorageKey, value: string): void {
  if (!isStorageAvailable()) {
    return;
  }

  localStorage.setItem(key, value);
}

/**
 * Removes a value from localStorage
 * @param key - The storage key to remove
 */
export function removeStorageItem(key: StorageKey): void {
  if (!isStorageAvailable()) {
    return;
  }

  localStorage.removeItem(key);
}

/**
 * Re-export STORAGE_KEYS for convenient access via Libs
 */
export { STORAGE_KEYS };
