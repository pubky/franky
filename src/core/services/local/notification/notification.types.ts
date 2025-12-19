import * as Core from '@/core';

export type TPersistAndGetUnreadCountParams = {
  flatNotifications: Core.TFlatNotificationList;
  lastRead: number;
};

export type TOlderThanQueryParams = {
  olderThan: number;
  limit: number;
};
