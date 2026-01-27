'use client';

import * as Molecules from '@/molecules';
import * as Core from '@/core';
import type { NotificationPreferences } from '@/core';
import { NOTIFICATION_LABELS } from './NotificationSettings.constants';

type NotificationType = keyof NotificationPreferences;

export function NotificationSettings() {
  const { notifications, setNotificationPreference } = Core.useSettingsStore();

  const handleToggle = (type: NotificationType) => {
    setNotificationPreference(type, !notifications[type]);
  };

  // Only show notification types that have defined labels
  // We have Lost friend on the server but we don't wantto show it
  const notificationTypes = (Object.keys(NOTIFICATION_LABELS) as NotificationType[]).filter(
    (type) => type in notifications,
  );

  return (
    <Molecules.SettingsSwitchGroup>
      {notificationTypes.map((type) => (
        <Molecules.SettingsSwitchItem
          key={type}
          id={`notification-switch-${type}`}
          label={NOTIFICATION_LABELS[type]}
          checked={notifications[type]}
          onChange={() => handleToggle(type)}
        />
      ))}
    </Molecules.SettingsSwitchGroup>
  );
}
