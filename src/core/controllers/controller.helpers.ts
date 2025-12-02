import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * Gets the currently active stream ID from the home store if on /home route.
 * This is a controller responsibility - controllers can access UI state stores.
 *
 * @returns The active stream ID, or null if not on /home route or if retrieval fails
 */
export function getActiveStreamId(): Core.PostStreamTypes | null {
  if (typeof window === 'undefined' || window.location.pathname !== '/home') {
    return null;
  }

  try {
    const homeState = Core.useHomeStore.getState();
    return Core.getStreamId(homeState.sort, homeState.reach, homeState.content);
  } catch (error) {
    Libs.Logger.warn('Failed to get active stream ID', { error });
    return null;
  }
}
