import { NotificationStore } from './notification.types';
import { ZustandGet } from '../stores.types';

// Selectors - State access functions with validation
export const createNotificationSelectors = (get: ZustandGet<NotificationStore>) => ({
  selectLastRead: () => {
    return get().lastRead;
  },

  selectUnread: () => {
    return get().unread;
  },
});
