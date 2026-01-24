'use client';

import { useTranslations } from 'next-intl';
import * as Molecules from '@/molecules';
import * as Core from '@/core';
import type { NotificationPreferences } from '@/core';
import { NOTIFICATION_LABEL_KEYS } from './NotificationSettings.constants';

type NotificationType = keyof NotificationPreferences;

export function NotificationSettings() {
  const t = useTranslations('notifications.settings');
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
          label={t(NOTIFICATION_LABEL_KEYS[type])}
          checked={notifications[type]}
          onChange={() => handleToggle(type)}
        />
      ))}
    </Molecules.SettingsSwitchGroup>
  );
}
