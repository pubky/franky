'use client';

import { useState } from 'react';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

const defaultPreferences = {
  follow: true,
  new_friend: true,
  lost_friend: true,
  tag_post: true,
  tag_profile: true,
  mention: true,
  reply: true,
  repost: true,
  post_deleted: true,
  post_edited: true,
};

type NotificationType = keyof typeof defaultPreferences;

const getNotificationLabel = (type: NotificationType): string => {
  const labels: Record<NotificationType, string> = {
    follow: 'New follower',
    new_friend: 'New friend',
    lost_friend: 'Lost friend',
    tag_post: 'Someone tagged your post',
    tag_profile: 'Someone tagged your profile',
    mention: 'Someone mentioned your profile',
    reply: 'New reply to your post',
    repost: 'New repost to your post',
    post_deleted: 'Someone deleted the post you interacted with',
    post_edited: 'Someone edited the post you interacted with',
  };
  return labels[type];
};

export interface NotificationsProps {
  className?: string;
}

export function Notifications({ className }: NotificationsProps): React.ReactElement {
  const [preferences, setPreferences] = useState(defaultPreferences);

  const handleToggle = (type: NotificationType): void => {
    setPreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
    // TODO: Save settings to storage or backend
  };

  return (
    <Molecules.SettingsSectionCard
      icon={Libs.Bell}
      title="Platform notifications"
      description="Please select which notifications you want to receive on Pubky."
      className={className}
    >
      <Molecules.SettingsSwitchGroup>
        {(Object.keys(preferences) as NotificationType[]).map((type) => (
          <Molecules.SettingsSwitchItem
            key={type}
            id={`notification-switch-${type}`}
            label={getNotificationLabel(type)}
            checked={preferences[type]}
            onChange={() => handleToggle(type)}
          />
        ))}
      </Molecules.SettingsSwitchGroup>
    </Molecules.SettingsSectionCard>
  );
}
