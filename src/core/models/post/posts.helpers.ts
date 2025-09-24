import { type NexusPostDetails, generateTestUserId } from '@/core';

export function generateTestPostId(userId: string, index: number): string {
  return `${userId}:post${index}`;
}

export function createTestPostDetails(overrides: Partial<NexusPostDetails> = {}): NexusPostDetails {
  return {
    id: generateTestPostId(generateTestUserId(0), 0),
    attachments: [],
    author: generateTestUserId(0),
    content: 'Test content',
    kind: 'short',
    uri: 'test://post',
    indexed_at: Date.now(),
    ...overrides,
  };
}
