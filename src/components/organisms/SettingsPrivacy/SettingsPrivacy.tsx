'use client';

import * as React from 'react';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export interface SettingsPrivacyProps {
  className?: string;
}

export function SettingsPrivacy({ className }: SettingsPrivacyProps) {
  const [showConfirmation, setShowConfirmation] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('checkLink');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [blurCensored, setBlurCensored] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('blurCensored');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const handleConfirmationToggle = (checked: boolean) => {
    setShowConfirmation(checked);
    localStorage.setItem('checkLink', String(checked));
  };

  const handleBlurToggle = (checked: boolean) => {
    setBlurCensored(checked);
    localStorage.setItem('blurCensored', String(checked));
  };

  return (
    <Molecules.SettingsSectionCard
      icon={Libs.ShieldCheck}
      title="Privacy and Safety"
      description="Privacy is not a crime. Manage your visibility and safety on Pubky."
      className={className}
    >
      <Molecules.SettingsSwitchGroup>
        <Molecules.SettingsSwitchItem
          id="show-confirmation-switch"
          label="Show confirmation before redirecting"
          checked={showConfirmation}
          onChange={handleConfirmationToggle}
        />
        <Molecules.SettingsSwitchItem
          id="blur-censored-switch"
          label="Blur censored posts or profile pictures"
          checked={blurCensored}
          onChange={handleBlurToggle}
        />
        <Molecules.SettingsSwitchItem
          id="sign-out-inactive-switch"
          label="Sign me out when inactive for 5 minutes"
          checked={false}
          disabled
        />
        <Molecules.SettingsSwitchItem
          id="require-pin-switch"
          label="Require PIN when inactive for 5 minutes"
          checked={false}
          disabled
        />
        <Molecules.SettingsSwitchItem
          id="hide-who-to-follow-switch"
          label="Hide your profile in 'Who to Follow'"
          checked={false}
          disabled
        />
        <Molecules.SettingsSwitchItem
          id="hide-active-friends-switch"
          label="Hide your profile in 'Active Friends'"
          checked={false}
          disabled
        />
        <Molecules.SettingsSwitchItem
          id="hide-search-switch"
          label="Hide your profile in search results"
          checked={false}
          disabled
        />
        <Molecules.SettingsSwitchItem
          id="never-show-posts-switch"
          label="Never show posts from people you don't follow"
          checked={false}
          disabled
        />
      </Molecules.SettingsSwitchGroup>
    </Molecules.SettingsSectionCard>
  );
}
