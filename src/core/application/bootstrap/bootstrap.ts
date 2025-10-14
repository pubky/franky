import * as Core from '@/core';
import * as Libs from '@/libs';

export class BootstrapApplication {
  static async read(pubky: Core.Pubky) {
    const data = await Core.NexusBootstrapService.read(pubky);
    await Core.LocalPersistenceService.persistBootstrap(data);
  }

  static async authorizeAndBootstrap(pubky: Core.Pubky) {
    let success = false;
    let retries = 0;
    while (!success && retries < 3) {
      try {
        // Wait 5 seconds before each attempt to let Nexus index the user
        Libs.Logger.info(`Waiting 5 seconds before bootstrap attempt ${retries + 1}...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await Core.BootstrapApplication.read(pubky);
        success = true;
      } catch (error) {
        Libs.Logger.error('Failed to bootstrap', error, retries);
        retries++;
      }
    }
    if (!success) {
      throw new Error('User still not indexed');
    }
  }
}
