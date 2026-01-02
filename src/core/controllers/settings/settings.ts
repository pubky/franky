import * as Core from '@/core';

/**
 * Settings controller.
 *
 * Entry point for settings-related operations that require homeserver sync.
 * Components should call these methods when user changes settings to ensure
 * changes are persisted to the homeserver.
 *
 * Pattern: Component → Controller → Application → HomeserverService
 */
export class SettingsController {
  private constructor() {} // Prevent instantiation

  /**
   * Commits a settings update to the homeserver.
   * Updates local store first, then syncs to homeserver.
   */
  private static async commitUpdate(): Promise<void> {
    const pubky = Core.useAuthStore.getState().selectCurrentUserPubky();
    const settings = Core.SettingsNormalizer.extractState(Core.useSettingsStore.getState());
    await Core.SettingsApplication.commitUpdate(settings, pubky);
  }

  /**
   * Updates a notification preference and syncs to homeserver.
   */
  static async setNotificationPreference(type: keyof Core.NotificationPreferences, enabled: boolean): Promise<void> {
    Core.useSettingsStore.getState().setNotificationPreference(type, enabled);
    await this.commitUpdate();
  }

  /**
   * Updates all notification preferences and syncs to homeserver.
   */
  static async setAllNotifications(preferences: Core.NotificationPreferences): Promise<void> {
    Core.useSettingsStore.getState().setAllNotifications(preferences);
    await this.commitUpdate();
  }

  /**
   * Updates privacy settings and syncs to homeserver.
   */
  static async setShowConfirm(showConfirm: boolean): Promise<void> {
    Core.useSettingsStore.getState().setShowConfirm(showConfirm);
    await this.commitUpdate();
  }

  static async setBlurCensored(blurCensored: boolean): Promise<void> {
    Core.useSettingsStore.getState().setBlurCensored(blurCensored);
    await this.commitUpdate();
  }

  static async setSignOutInactive(signOutInactive: boolean): Promise<void> {
    Core.useSettingsStore.getState().setSignOutInactive(signOutInactive);
    await this.commitUpdate();
  }

  static async setRequirePin(requirePin: boolean): Promise<void> {
    Core.useSettingsStore.getState().setRequirePin(requirePin);
    await this.commitUpdate();
  }

  static async setHideWhoToFollow(hideWhoToFollow: boolean): Promise<void> {
    Core.useSettingsStore.getState().setHideWhoToFollow(hideWhoToFollow);
    await this.commitUpdate();
  }

  static async setHideActiveFriends(hideActiveFriends: boolean): Promise<void> {
    Core.useSettingsStore.getState().setHideActiveFriends(hideActiveFriends);
    await this.commitUpdate();
  }

  static async setHideSearch(hideSearch: boolean): Promise<void> {
    Core.useSettingsStore.getState().setHideSearch(hideSearch);
    await this.commitUpdate();
  }

  static async setNeverShowPosts(neverShowPosts: boolean): Promise<void> {
    Core.useSettingsStore.getState().setNeverShowPosts(neverShowPosts);
    await this.commitUpdate();
  }

  /**
   * Muted users management with homeserver sync.
   */
  static async addMutedUser(userId: string): Promise<void> {
    Core.useSettingsStore.getState().addMutedUser(userId);
    await this.commitUpdate();
  }

  static async removeMutedUser(userId: string): Promise<void> {
    Core.useSettingsStore.getState().removeMutedUser(userId);
    await this.commitUpdate();
  }

  static async setMutedUsers(userIds: string[]): Promise<void> {
    Core.useSettingsStore.getState().setMutedUsers(userIds);
    await this.commitUpdate();
  }

  static async clearMutedUsers(): Promise<void> {
    Core.useSettingsStore.getState().clearMutedUsers();
    await this.commitUpdate();
  }

  /**
   * Updates language preference and syncs to homeserver.
   */
  static async setLanguage(language: string): Promise<void> {
    Core.useSettingsStore.getState().setLanguage(language);
    await this.commitUpdate();
  }

  /**
   * Resets settings to defaults and syncs to homeserver.
   */
  static async reset(): Promise<void> {
    Core.useSettingsStore.getState().reset();
    await this.commitUpdate();
  }
}
