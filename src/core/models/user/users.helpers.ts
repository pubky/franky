import { type Pubky, type NexusUserDetails } from '@/core';

export function generateTestUserId(index: number = 0): Pubky {
  return `operrr8wsbpr3ue9d4qj41ge1kcc6r7fdiy6o3ugjrrhi4y77rd${index}`;
}

export function createTestUserDetails(overrides: Partial<NexusUserDetails> = {}): NexusUserDetails {
  return {
    id: generateTestUserId(0),
    indexed_at: Date.now(),
    name: 'Test User',
    bio: 'Test Bio',
    image: 'test.jpg',
    status: 'active',
    links: [],
    ...overrides,
  };
}
