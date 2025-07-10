import type { ProfileStore } from '@/core';

// Basic selectors - Pure state access functions
export const getCurrentUserPubky = (state: ProfileStore) => state.currentUserPubky;
export const getSession = (state: ProfileStore) => state.session;
export const getIsAuthenticated = (state: ProfileStore) => state.isAuthenticated;

// Computed selectors - Derived state
export const getHasSession = (state: ProfileStore) => {
  return state.session !== null;
};

export const getHasUserPubky = (state: ProfileStore) => {
  return state.currentUserPubky !== null && state.currentUserPubky.length > 0;
};

export const getIsFullyAuthenticated = (state: ProfileStore) => {
  return state.isAuthenticated && state.currentUserPubky !== null && state.session !== null;
};

export const getCanCreateContent = (state: ProfileStore) => {
  return state.isAuthenticated && state.currentUserPubky !== null;
};

// Legacy object export for backward compatibility (can be removed later)
export const profileSelectors = {
  getCurrentUserPubky,
  getSession,
  getIsAuthenticated,
  getHasSession,
  getHasUserPubky,
  getIsFullyAuthenticated,
  getCanCreateContent,
};
