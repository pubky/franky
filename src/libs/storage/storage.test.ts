import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getStorageBoolean,
  setStorageBoolean,
  getStorageString,
  setStorageString,
  removeStorageItem,
  STORAGE_KEYS,
} from './storage';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('STORAGE_KEYS', () => {
    it('exports CHECK_LINK key', () => {
      expect(STORAGE_KEYS.CHECK_LINK).toBe('checkLink');
    });

    it('exports BLUR_CENSORED key', () => {
      expect(STORAGE_KEYS.BLUR_CENSORED).toBe('blurCensored');
    });
  });

  describe('getStorageBoolean', () => {
    it('returns true when value is "true"', () => {
      mockLocalStorage.getItem.mockReturnValue('true');
      expect(getStorageBoolean(STORAGE_KEYS.CHECK_LINK)).toBe(true);
    });

    it('returns false when value is "false"', () => {
      mockLocalStorage.getItem.mockReturnValue('false');
      expect(getStorageBoolean(STORAGE_KEYS.CHECK_LINK)).toBe(false);
    });

    it('returns default value when key not found', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(getStorageBoolean(STORAGE_KEYS.CHECK_LINK)).toBe(true); // default from STORAGE_DEFAULTS
    });

    it('returns custom default value when key not found', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(getStorageBoolean(STORAGE_KEYS.CHECK_LINK, false)).toBe(false);
    });
  });

  describe('setStorageBoolean', () => {
    it('stores true as "true"', () => {
      setStorageBoolean(STORAGE_KEYS.CHECK_LINK, true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('checkLink', 'true');
    });

    it('stores false as "false"', () => {
      setStorageBoolean(STORAGE_KEYS.CHECK_LINK, false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('checkLink', 'false');
    });
  });

  describe('getStorageString', () => {
    it('returns stored string value', () => {
      mockLocalStorage.getItem.mockReturnValue('test-value');
      expect(getStorageString(STORAGE_KEYS.CHECK_LINK)).toBe('test-value');
    });

    it('returns default value when key not found', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(getStorageString(STORAGE_KEYS.CHECK_LINK, 'default')).toBe('default');
    });

    it('returns empty string as default when no default provided', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(getStorageString(STORAGE_KEYS.CHECK_LINK)).toBe('');
    });
  });

  describe('setStorageString', () => {
    it('stores string value', () => {
      setStorageString(STORAGE_KEYS.CHECK_LINK, 'my-value');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('checkLink', 'my-value');
    });
  });

  describe('removeStorageItem', () => {
    it('removes item from storage', () => {
      removeStorageItem(STORAGE_KEYS.CHECK_LINK);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('checkLink');
    });
  });
});
