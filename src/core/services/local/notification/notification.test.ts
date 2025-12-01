import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import { LocalNotificationService } from './notification';

const createNexus = (timestamp: number): Core.NexusNotification => ({
  timestamp,
  body: { type: Core.NotificationType.Follow, followed_by: `user-${timestamp}` },
});

const createFlat = (timestamp: number): Core.FlatNotification =>
  ({ type: Core.NotificationType.Follow, timestamp, followed_by: `user-${timestamp}` }) as Core.FlatNotification;

const mockNormalizer = () =>
  vi.spyOn(Core.NotificationNormalizer, 'toFlatNotification').mockImplementation((n) => createFlat(n.timestamp));

describe('LocalNotificationService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('persistAndGetUnreadCount', () => {
    const lastRead = 1000;

    it('should transform, persist, and return unread count', async () => {
      const notifications = [createNexus(2000), createNexus(1500), createNexus(500)];
      mockNormalizer();
      const bulkSaveSpy = vi.spyOn(Core.NotificationModel, 'bulkSave').mockResolvedValue(undefined);

      const unreadCount = await LocalNotificationService.persistAndGetUnreadCount(notifications, lastRead);

      expect(unreadCount).toBe(2); // 2000 and 1500 are newer than 1000
      expect(bulkSaveSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ timestamp: 2000 }),
          expect.objectContaining({ timestamp: 1500 }),
          expect.objectContaining({ timestamp: 500 }),
        ]),
      );
    });

    it.each([
      { timestamps: [500, 300], lastRead: 1000, expected: 0, desc: 'all older' },
      { timestamps: [3000, 2000], lastRead: 1000, expected: 2, desc: 'all newer' },
      { timestamps: [1000], lastRead: 1000, expected: 0, desc: 'equal to lastRead' },
      { timestamps: [], lastRead: 1000, expected: 0, desc: 'empty list' },
    ])('should return $expected when $desc', async ({ timestamps, lastRead, expected }) => {
      mockNormalizer();
      vi.spyOn(Core.NotificationModel, 'bulkSave').mockResolvedValue(undefined);

      const unreadCount = await LocalNotificationService.persistAndGetUnreadCount(
        timestamps.map(createNexus),
        lastRead,
      );

      expect(unreadCount).toBe(expected);
    });

    it('should bubble bulkSave errors', async () => {
      mockNormalizer();
      vi.spyOn(Core.NotificationModel, 'bulkSave').mockRejectedValue(new Error('db-error'));

      await expect(LocalNotificationService.persistAndGetUnreadCount([createNexus(2000)], lastRead)).rejects.toThrow(
        'db-error',
      );
    });
  });

  describe('getOlderThan', () => {
    it('should delegate to NotificationModel.getOlderThan', async () => {
      const expected = [createFlat(4000), createFlat(3000)];
      const modelSpy = vi.spyOn(Core.NotificationModel, 'getOlderThan').mockResolvedValue(expected);

      const result = await LocalNotificationService.getOlderThan(5000, 10);

      expect(modelSpy).toHaveBeenCalledWith(5000, 10);
      expect(result).toEqual(expected);
    });

    it('should return empty array when no notifications found', async () => {
      vi.spyOn(Core.NotificationModel, 'getOlderThan').mockResolvedValue([]);

      const result = await LocalNotificationService.getOlderThan(1000, 10);

      expect(result).toEqual([]);
    });

    it('should bubble model errors', async () => {
      vi.spyOn(Core.NotificationModel, 'getOlderThan').mockRejectedValue(new Error('query-failed'));

      await expect(LocalNotificationService.getOlderThan(1000, 10)).rejects.toThrow('query-failed');
    });
  });

  describe('getAll', () => {
    it('should delegate to NotificationModel.getAll', async () => {
      const expected = [createFlat(3000), createFlat(2000), createFlat(1000)];
      const modelSpy = vi.spyOn(Core.NotificationModel, 'getAll').mockResolvedValue(expected);

      const result = await LocalNotificationService.getAll();

      expect(modelSpy).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });

    it('should return empty array when no notifications exist', async () => {
      vi.spyOn(Core.NotificationModel, 'getAll').mockResolvedValue([]);

      const result = await LocalNotificationService.getAll();

      expect(result).toEqual([]);
    });

    it('should bubble model errors', async () => {
      vi.spyOn(Core.NotificationModel, 'getAll').mockRejectedValue(new Error('query-failed'));

      await expect(LocalNotificationService.getAll()).rejects.toThrow('query-failed');
    });
  });

  describe('getOlderThanByTypes', () => {
    it('should delegate to NotificationModel.getOlderThanByTypes with types', async () => {
      const expected = [createFlat(4000), createFlat(3000)];
      const modelSpy = vi.spyOn(Core.NotificationModel, 'getOlderThanByTypes').mockResolvedValue(expected);
      const types = [Core.NotificationType.Follow, Core.NotificationType.Reply];

      const result = await LocalNotificationService.getOlderThanByTypes(types, 5000, 10);

      expect(modelSpy).toHaveBeenCalledWith(types, 5000, 10);
      expect(result).toEqual(expected);
    });

    it('should delegate with null types for all notifications', async () => {
      const expected = [createFlat(4000), createFlat(3000)];
      const modelSpy = vi.spyOn(Core.NotificationModel, 'getOlderThanByTypes').mockResolvedValue(expected);

      const result = await LocalNotificationService.getOlderThanByTypes(null, 5000, 10);

      expect(modelSpy).toHaveBeenCalledWith(null, 5000, 10);
      expect(result).toEqual(expected);
    });

    it('should return empty array when no notifications found', async () => {
      vi.spyOn(Core.NotificationModel, 'getOlderThanByTypes').mockResolvedValue([]);

      const result = await LocalNotificationService.getOlderThanByTypes([Core.NotificationType.Reply], 1000, 10);

      expect(result).toEqual([]);
    });

    it('should bubble model errors', async () => {
      vi.spyOn(Core.NotificationModel, 'getOlderThanByTypes').mockRejectedValue(new Error('query-failed'));

      await expect(
        LocalNotificationService.getOlderThanByTypes([Core.NotificationType.Reply], 1000, 10),
      ).rejects.toThrow('query-failed');
    });
  });
});
