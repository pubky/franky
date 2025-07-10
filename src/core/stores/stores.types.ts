/* eslint-disable @typescript-eslint/no-explicit-any */

// Shared Zustand types for all stores

// Generic type for Zustand's set function with DevTools support
export type ZustandSet<T> = {
  (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: false, action?: any): void;
  (state: T | ((state: T) => T), replace: true, action?: any): void;
};

// Generic type for Zustand's get function
export type ZustandGet<T> = () => T;
