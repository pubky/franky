'use client';

import * as React from 'react';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';
import * as Core from '@/core';

export function Privacy() {
  const {
    privacy,
    setShowConfirm,
    setBlurCensored,
    setSignOutInactive,
    setRequirePin,
    setHideWhoToFollow,
    setHideActiveFriends,
    setHideSearch,
    setNeverShowPosts,
  } = Core.useSettingsStore();

  const handleConfirmationToggle = (checked: boolean) => {
    setShowConfirm(checked);
  };

  const handleBlurToggle = (checked: boolean) => {
    setBlurCensored(checked);
  };

  const handleSignOutInactiveToggle = (checked: boolean) => {
    setSignOutInactive(checked);
  };

  const handleRequirePinToggle = (checked: boolean) => {
    setRequirePin(checked);
  };

  const handleHideWhoToFollowToggle = (checked: boolean) => {
    setHideWhoToFollow(checked);
  };

  const handleHideActiveFriendsToggle = (checked: boolean) => {
    setHideActiveFriends(checked);
  };

  const handleHideSearchToggle = (checked: boolean) => {
    setHideSearch(checked);
  };

  const handleNeverShowPostsToggle = (checked: boolean) => {
    setNeverShowPosts(checked);
  };

  return (
    <Molecules.SettingsSectionCard
      icon={Libs.ShieldCheck}
      title="Privacy and Safety"
      description="Privacy is not a crime. Manage your visibility and safety on Pubky."
    >
      <Molecules.SettingsSwitchGroup>
        <Molecules.SettingsSwitchItem
          id="show-confirmation-switch"
          label="Show confirmation before redirecting"
          checked={privacy.showConfirm}
          onChange={handleConfirmationToggle}
        />
        <Molecules.SettingsSwitchItem
          id="blur-censored-switch"
          label="Blur censored posts or profile pictures"
          checked={privacy.blurCensored}
          onChange={handleBlurToggle}
        />
        <Molecules.SettingsSwitchItem
          id="sign-out-inactive-switch"
          label="Sign me out when inactive for 5 minutes"
          checked={privacy.signOutInactive}
          onChange={handleSignOutInactiveToggle}
          disabled
        />
        <Molecules.SettingsSwitchItem
          id="require-pin-switch"
          label="Require PIN when inactive for 5 minutes"
          checked={privacy.requirePin}
          onChange={handleRequirePinToggle}
          disabled
        />
        <Molecules.SettingsSwitchItem
          id="hide-who-to-follow-switch"
          label="Hide your profile in 'Who to Follow'"
          checked={privacy.hideWhoToFollow}
          onChange={handleHideWhoToFollowToggle}
          disabled
        />
        <Molecules.SettingsSwitchItem
          id="hide-active-friends-switch"
          label="Hide your profile in 'Active Friends'"
          checked={privacy.hideActiveFriends}
          onChange={handleHideActiveFriendsToggle}
          disabled
        />
        <Molecules.SettingsSwitchItem
          id="hide-search-switch"
          label="Hide your profile in search results"
          checked={privacy.hideSearch}
          onChange={handleHideSearchToggle}
          disabled
        />
        <Molecules.SettingsSwitchItem
          id="never-show-posts-switch"
          label="Never show posts from people you don't follow"
          checked={privacy.neverShowPosts}
          onChange={handleNeverShowPostsToggle}
          disabled
        />
      </Molecules.SettingsSwitchGroup>
    </Molecules.SettingsSectionCard>
  );
}
