'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
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

export interface SettingsNotificationsProps {
  className?: string;
}

export function SettingsNotifications({ className }: SettingsNotificationsProps) {
  const [preferences, setPreferences] = React.useState(defaultPreferences);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading from storage/API
    const loadPreferences = async () => {
      setIsLoading(true);
      // TODO: Load from actual storage
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false);
    };
    loadPreferences();
  }, []);

  const handleToggle = (type: NotificationType) => {
    setPreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
    // TODO: Save settings to storage or backend
  };

  if (isLoading) {
    return <Atoms.SettingsLoader className={className} />;
  }

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
