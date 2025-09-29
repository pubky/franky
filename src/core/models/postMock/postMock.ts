import { v4 as uuidv4 } from 'uuid';
import { PostModelPK, PostMock, TagModel } from '@/core';

export class PostMockGenerator {
  private static readonly WORD_POOLS = {
    subjects: [
      'decentralization',
      'blockchain',
      'protocol',
      'network',
      'community',
      'innovation',
      'technology',
      'development',
      'future',
      'web3',
      'crypto',
      'privacy',
      'security',
      'open source',
      'peer-to-peer',
      'distributed systems',
      'consensus',
      'nodes',
      'developers',
      'users',
      'data',
      'freedom',
      'sovereignty',
      'infrastructure',
    ],
    verbs: [
      'building',
      'creating',
      'developing',
      'exploring',
      'discovering',
      'implementing',
      'revolutionizing',
      'transforming',
      'connecting',
      'empowering',
      'enabling',
      'advancing',
      'improving',
      'optimizing',
      'scaling',
      'securing',
      'protecting',
      'innovating',
      'collaborating',
      'contributing',
      'sharing',
      'learning',
      'growing',
      'evolving',
    ],
    adjectives: [
      'amazing',
      'incredible',
      'powerful',
      'revolutionary',
      'innovative',
      'secure',
      'decentralized',
      'distributed',
      'open',
      'transparent',
      'trustless',
      'permissionless',
      'scalable',
      'efficient',
      'robust',
      'resilient',
      'flexible',
      'modular',
      'interoperable',
      'composable',
      'sustainable',
      'cutting-edge',
      'next-generation',
    ],
    objects: [
      'solutions',
      'applications',
      'protocols',
      'networks',
      'platforms',
      'tools',
      'systems',
      'frameworks',
      'libraries',
      'interfaces',
      'experiences',
      'communities',
      'ecosystems',
      'standards',
      'specifications',
      'implementations',
      'features',
      'capabilities',
      'opportunities',
      'possibilities',
      'connections',
      'relationships',
    ],
    emotions: [
      '🚀',
      '💡',
      '🔥',
      '✨',
      '🌟',
      '⚡',
      '🎯',
      '💪',
      '🎉',
      '🔮',
      '🛠️',
      '⚙️',
      '🔧',
      '💎',
      '🏗️',
      '🌐',
      '🔗',
      '🛡️',
      '🔐',
      '🗝️',
    ],
  };

  private static getRandomFromArray<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static generateRandomSentence(): string {
    const patterns = [
      () =>
        `${this.getRandomFromArray(this.WORD_POOLS.verbs)} ${this.getRandomFromArray(this.WORD_POOLS.adjectives)} ${this.getRandomFromArray(this.WORD_POOLS.objects)}`,
      () =>
        `The future of ${this.getRandomFromArray(this.WORD_POOLS.subjects)} is ${this.getRandomFromArray(this.WORD_POOLS.adjectives)}`,
      () =>
        `Just ${this.getRandomFromArray(this.WORD_POOLS.verbs)} something ${this.getRandomFromArray(this.WORD_POOLS.adjectives)} with ${this.getRandomFromArray(this.WORD_POOLS.subjects)}`,
      () =>
        `${this.getRandomFromArray(this.WORD_POOLS.subjects)} ${this.getRandomFromArray(this.WORD_POOLS.verbs)} ${this.getRandomFromArray(this.WORD_POOLS.adjectives)} ${this.getRandomFromArray(this.WORD_POOLS.objects)}`,
      () =>
        `Working on ${this.getRandomFromArray(this.WORD_POOLS.adjectives)} ${this.getRandomFromArray(this.WORD_POOLS.objects)} for ${this.getRandomFromArray(this.WORD_POOLS.subjects)}`,
      () =>
        `${this.getRandomFromArray(this.WORD_POOLS.adjectives)} ${this.getRandomFromArray(this.WORD_POOLS.subjects)} enables ${this.getRandomFromArray(this.WORD_POOLS.adjectives)} ${this.getRandomFromArray(this.WORD_POOLS.objects)}`,
    ];

    const selectedPattern = this.getRandomFromArray(patterns);
    const sentence = selectedPattern();
    const emoji = Math.random() > 0.7 ? ` ${this.getRandomFromArray(this.WORD_POOLS.emotions)}` : '';

    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + emoji;
  }

  static generateRandomText(): string {
    const sentenceCount = Math.floor(Math.random() * 3) + 1; // 1-3 sentences
    const sentences: string[] = [];

    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(this.generateRandomSentence());
    }

    return sentences.join('. ') + (sentences.length > 1 ? '.' : '');
  }

  static generateUUID(): string {
    return uuidv4();
  }

  private static generateRandomAuthor(): string {
    const names = [
      'Alice Johnson',
      'Bob Smith',
      'Charlie Brown',
      'Diana Prince',
      'Eve Wilson',
      'Frank Miller',
      'Grace Lee',
      'Henry Davis',
      'Ivy Chen',
      'Jack Thompson',
      'Kate Rodriguez',
      'Leo Zhang',
      'Maya Patel',
      'Nathan Kim',
      'Olivia Taylor',
      'Paul Anderson',
      "Quinn O'Brien",
      'Rachel Green',
      'Sam Williams',
      'Tara Singh',
    ];
    return this.getRandomFromArray(names);
  }

  private static generateRandomPubkey(): string {
    // Generate a realistic-looking pubkey (64 hex characters)
    const chars = '0123456789abcdef';
    let pubkey = '';
    for (let i = 0; i < 64; i++) {
      pubkey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pubkey;
  }

  private static generateSampleTags(): TagModel[] {
    const possibleTags = [
      'interesting',
      'technology',
      'development',
      'crypto',
      'web3',
      'blockchain',
      'decentralization',
      'privacy',
      'security',
      'innovation',
      'programming',
      'coding',
      'software',
      'design',
      'ui',
      'ux',
      'protocol',
      'network',
      'consensus',
      'p2p',
      'distributed',
    ];

    const tagCount = Math.floor(Math.random() * 4); // 0-3 tags
    const selectedTags = [];
    const usedLabels = new Set();

    for (let i = 0; i < tagCount; i++) {
      let label;
      do {
        label = this.getRandomFromArray(possibleTags);
      } while (usedLabels.has(label));

      usedLabels.add(label);

      // Generate 1-5 mock taggers for each tag
      const taggerCount = Math.floor(Math.random() * 5) + 1;
      const taggers = [];
      for (let j = 0; j < taggerCount; j++) {
        taggers.push(`user-${Math.floor(Math.random() * 100)}`);
      }

      selectedTags.push(
        new TagModel({
          label,
          taggers,
          taggers_count: taggers.length,
          relationship: Math.random() > 0.7, // 30% chance of being a relationship tag
        }),
      );
    }

    return selectedTags;
  }

  static create(overrides: Partial<PostMock> = {}): PostMock {
    return {
      id: this.generateUUID() as PostModelPK,
      text: this.generateRandomText(),
      createdAt: Date.now(),
      author: this.generateRandomAuthor(),
      authorPubkey: this.generateRandomPubkey(),
      tags: this.generateSampleTags(),
      ...overrides,
    };
  }

  static createMultiple(count: number): PostMock[] {
    const posts: PostMock[] = [];
    for (let i = 0; i < count; i++) {
      // Add some time variation to make posts seem more realistic
      const timeOffset = Math.floor(Math.random() * 3600000); // Random offset up to 1 hour
      posts.push(
        this.create({
          createdAt: Date.now() - timeOffset,
        }),
      );
    }

    // Sort by creation time (newest first)
    return posts.sort((a, b) => b.createdAt - a.createdAt);
  }
}
