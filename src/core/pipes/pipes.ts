import init, { PostResult, PubkyAppPostKind, PubkySpecsBuilder, UserResult } from 'pubky-app-specs';
import { PostValidatorData, UserValidatorData } from '@/core';
import { Keypair } from '@synonymdev/pubky';
import { Logger } from '@/libs';

// Pipes have two typical use cases:
// 1. validation: evaluate input data and if valid, simply pass it through unchanged; otherwise, throw an exception
// 2. transformation: transform input data to the desired PubkyAppSpecs format

export class PubkySpecsPipes {
  private static keypair: Keypair;
  private static initialized = false;

  private constructor() {}

  private static async ensureInitialized() {
    if (!this.initialized) {
      await init();
      this.initialized = true;
    }
  }

  static setKeypair(keypair: Keypair) {
    this.keypair = keypair;
  }

  private static getBuilder(pubkey: string): PubkySpecsBuilder {
    if (!this.initialized) {
      throw new Error('PubkySpecsPipes not initialized. Call ensureInitialized() first.');
    }
    return new PubkySpecsBuilder(pubkey);
  }

  static async normalizePost(post: PostValidatorData, pubkey: string): Promise<PostResult> {
    await this.ensureInitialized();
    const builder = this.getBuilder(pubkey);

    const kind = post.kind === 'short' ? PubkyAppPostKind.Short : PubkyAppPostKind.Long;
    const result = builder.createPost(post.content, kind);

    Logger.debug('Post validated', { result });

    return result;
  }

  static async normalizeUser(user: UserValidatorData, pubkey: string): Promise<UserResult> {
    await this.ensureInitialized();
    const builder = this.getBuilder(pubkey);
    const result = builder.createUser(user.name, user.bio, user.image, user.links);

    Logger.debug('User validated', { result });

    return result;
  }
}
