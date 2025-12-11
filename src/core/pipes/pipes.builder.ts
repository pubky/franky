import { PubkySpecsBuilder } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class PubkySpecsSingleton {
  private static builder: PubkySpecsBuilder | null = null;
  private static currentPubky: Core.Pubky | null = null;

  private constructor() {}

  static get(pubky: Core.Pubky): PubkySpecsBuilder {
    if (!this.builder) {
      this.builder = new PubkySpecsBuilder(pubky);
      this.currentPubky = pubky;
    }
    // If pubky has changed, recreate the builder
    else if (this.currentPubky !== pubky) {
      try {
        this.builder = new PubkySpecsBuilder(pubky);
        this.currentPubky = pubky;
      } catch (e) {
        Libs.Logger.error('Invalid pubky. Cannot create builder.', { pubky, error: e });
        throw new Error('Failed to initialize PubkySpecsBuilder with new pubky');
      }
    }
    return this.builder;
  }

  /**
   * Resets the singleton state. Should be called during sign-out
   * to ensure clean state for subsequent sign-ins.
   * Also useful for testing purposes.
   */
  static reset(): void {
    this.builder = null;
    this.currentPubky = null;
  }
}
