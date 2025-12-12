'use client';

import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Core from '@/core';
import type { NotificationPreferences } from '@/core';

type NotificationType = keyof NotificationPreferences;

const getNotificationLabel = (type: NotificationType): string => {
  const labels: Record<NotificationType, string> = {
    follow: 'New follower',
    newFriend: 'New friend',
    lostFriend: 'Lost friend',
    tagPost: 'Someone tagged your post',
    tagProfile: 'Someone tagged your profile',
    mention: 'Someone mentioned your profile',
    reply: 'New reply to your post',
    repost: 'New repost to your post',
    postDeleted: 'Someone deleted the post you interacted with',
    postEdited: 'Someone edited the post you interacted with',
  };
  return labels[type];
};

export function Notifications() {
  const { notifications, setNotificationPreference } = Core.useSettingsStore();

  const handleToggle = (type: NotificationType) => {
    setNotificationPreference(type, !notifications[type]);
  };

  return (
    <Molecules.SettingsSectionCard
      icon={Libs.Bell}
      title="Platform notifications"
      description="Please select which notifications you want to receive on Pubky."
    >
      <Molecules.SettingsSwitchGroup>
        {(Object.keys(notifications) as NotificationType[]).map((type) => (
          <Molecules.SettingsSwitchItem
            key={type}
            id={`notification-switch-${type}`}
            label={getNotificationLabel(type)}
            checked={notifications[type]}
            onChange={() => handleToggle(type)}
          />
        ))}
      </Molecules.SettingsSwitchGroup>
    </Molecules.SettingsSectionCard>
  );
}
