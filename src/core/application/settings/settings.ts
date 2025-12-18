import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * Settings application service.
 *
 * Handles synchronization of user settings between the local store and homeserver.
 * Settings are stored at: pubky://{pubky}/pub/pubky.app/settings.json
 */
export class SettingsApplication {
  private constructor() {}

  /**
   * Commits settings update to the homeserver.
   *
   * @param settings, The current settings state to persist
   * @param pubky, The user's public key
   */
  static async commitUpdate(settings: Core.SettingsState, pubky: Core.Pubky): Promise<void> {
    const { settings: settingsJson, meta } = Core.SettingsNormalizer.to(settings, pubky);

    Libs.Logger.info('[Settings] Pushing to homeserver', { url: meta.url, settings: settingsJson });

    await Core.HomeserverService.request(
      Core.HomeserverAction.PUT,
      meta.url,
      settingsJson as unknown as Record<string, unknown>,
    );

    Libs.Logger.info('[Settings] Push complete');
  }

  /**
   * Fetches settings from the homeserver.
   * Returns null if settings don't exist on homeserver (404).
   *
   * @param pubky, The user's public key
   * @returns The settings state from homeserver, or null if not found
   */
  static async fetchFromHomeserver(pubky: Core.Pubky): Promise<Core.SettingsState | null> {
    const url = Core.SettingsNormalizer.buildUrl(pubky);

    Libs.Logger.info('[Settings] Pulling from homeserver', { url });

    try {
      const settingsJson = await Core.HomeserverService.request<Core.SettingsJson>(Core.HomeserverAction.GET, url);

      if (!settingsJson) {
        Libs.Logger.info('[Settings] Pull complete, no settings found');
        return null;
      }

      const settings = Core.SettingsNormalizer.from(settingsJson);
      Libs.Logger.info('[Settings] Pull complete', { settings });
      return settings;
    } catch (error) {
      // Handle 404, settings don't exist yet
      if (error instanceof Libs.AppError && error.statusCode === 404) {
        Libs.Logger.info('[Settings] Pull complete, settings file not found (404)');
        return null;
      }
      throw error;
    }
  }

  /**
   * Initializes settings on bootstrap.
   * Fetches settings from homeserver and merges with local settings.
   * Uses version and timestamp for conflict resolution (newer wins).
   *
   * @param pubky, The user's public key
   * @returns The remote settings if newer than local, or null if local is newer/equal
   * @throws If fetch or sync operations fail, caller should handle errors
   */
  static async initializeSettings(pubky: Core.Pubky): Promise<Core.SettingsState | null> {
    Libs.Logger.info('[Settings] Initializing settings sync');

    const localSettings = Core.SettingsNormalizer.extractState(Core.useSettingsStore.getState());
    const remoteSettings = await this.fetchFromHomeserver(pubky);

    if (!remoteSettings) {
      Libs.Logger.info('[Settings] No remote settings, pushing local to homeserver');
      await this.commitUpdate(localSettings, pubky);
      return null;
    }

    // Check if remote settings are newer (higher version or same version with newer timestamp)
    const isRemoteNewer =
      remoteSettings.version > localSettings.version ||
      (remoteSettings.version === localSettings.version && remoteSettings.updatedAt > localSettings.updatedAt);

    Libs.Logger.info('[Settings] Comparing versions', {
      local: { version: localSettings.version, updatedAt: localSettings.updatedAt },
      remote: { version: remoteSettings.version, updatedAt: remoteSettings.updatedAt },
      isRemoteNewer,
    });

    if (isRemoteNewer) {
      Libs.Logger.info('[Settings] Using remote settings (newer)');
      return remoteSettings;
    }

    Libs.Logger.info('[Settings] Local settings newer, pushing to homeserver');
    await this.commitUpdate(localSettings, pubky);
    return null;
  }
}
