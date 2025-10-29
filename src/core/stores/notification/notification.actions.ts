import {
  NotificationStore,
  NotificationActions,
  notificationInitialState,
  NotificationActionTypes,
  NotificationState,
} from './notification.types';
import { ZustandSet } from '../stores.types';

// Actions/Mutators - State modification functions
export const createNotificationActions = (set: ZustandSet<NotificationStore>): NotificationActions => ({
  init: (state: NotificationState) => {
    if (typeof state.unread === 'number') {
      state.unread = Math.max(0, state.unread);
    }
    set(state, false, NotificationActionTypes.INIT);
  },

  setLastRead: (lastRead: number) => {
    set({ lastRead }, false, NotificationActionTypes.SET_LAST_READ);
  },

  setUnread: (unread: number) => {
    // Ensure unread count is never negative
    const validUnread = Math.max(0, unread);
    set({ unread: validUnread }, false, NotificationActionTypes.SET_UNREAD);
  },

  markAllAsRead: () => {
    set({ lastRead: 0, unread: 0 }, false, NotificationActionTypes.MARK_ALL_AS_READ);
  },

  reset: () => {
    set(notificationInitialState, false, NotificationActionTypes.RESET);
  },
});
