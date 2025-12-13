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

  return (
    <Molecules.SettingsSwitchGroup>
      {(Object.keys(notifications) as NotificationType[]).map((type) => (
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
