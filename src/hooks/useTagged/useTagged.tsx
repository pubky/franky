'use client';

import { useState, useMemo } from 'react';
import type { NexusTag } from '@/core/services/nexus/nexus.types';

export interface UseTaggedResult {
  tags: NexusTag[];
  count: number;
  isLoading: boolean;
  handleTagAdd: (tagString: string) => void;
}

/**
 * Hook for fetching and managing tagged data.
 *
 * TODO: Implement real data fetching using TagController or UserTagsModel.
 * This will fetch tags from the local database and sync with the homeserver.
 *
 * @returns Tags array, loading state, and handleTagAdd function
 */
export function useTagged(): UseTaggedResult {
  // TODO: Implement real data fetching here
  // - Fetch tags from UserTagsModel.getTags(userId)
  // - Or fetch from Nexus API using UserController.tags()
  const mockTags = useMemo(() => {
    // Mock data for testing
    return [
      {
        label: 'bitcoin',
        taggers: [
          'user1pubky123456789012345678901234567890',
          'user2pubky123456789012345678901234567890',
          'user3pubky123456789012345678901234567890',
          'user4pubky123456789012345678901234567890',
          'user5pubky123456789012345678901234567890',
          'user6pubky123456789012345678901234567890',
          'user7pubky123456789012345678901234567890',
          'user8pubky123456789012345678901234567890',
          'user9pubky123456789012345678901234567890',
          'user10pubky123456789012345678901234567890',
          'user11pubky123456789012345678901234567890',
          'user12pubky123456789012345678901234567890',
        ],
        taggers_count: 12,
        relationship: false,
      },
      {
        label: 'satoshi',
        taggers: [
          'user1pubky123456789012345678901234567890',
          'user2pubky123456789012345678901234567890',
          'user3pubky123456789012345678901234567890',
        ],
        taggers_count: 3,
        relationship: false,
      },
      {
        label: 'og',
        taggers: ['user1pubky123456789012345678901234567890', 'user2pubky123456789012345678901234567890'],
        taggers_count: 2,
        relationship: false,
      },
    ] as NexusTag[];
  }, []);

  const [tags, setTags] = useState<NexusTag[]>(mockTags);

  const handleTagAdd = (tagString: string) => {
    const trimmedTag = tagString.trim();

    if (!trimmedTag) return; // Don't add tag if empty

    // Extract text without emoji for comparison (to check duplicates)
    const textWithoutEmoji = trimmedTag.replace(/^\p{Emoji}+/u, '').trim();

    if (!textWithoutEmoji) return; // Don't add tag if no text after emoji removal

    // Check if tag already exists (compare by text without emoji)
    const tagExists = tags.some((tag) => {
      const existingText = tag.label.replace(/^\p{Emoji}+/u, '').trim();
      return existingText.toLowerCase() === textWithoutEmoji.toLowerCase();
    });

    if (tagExists) {
      // Tag already exists, return early (input will be cleared by TagInput)
      return;
    }

    // Create new tag object with emoji preserved
    const newTag: NexusTag = {
      label: trimmedTag, // Preserve emoji + text
      taggers: [],
      taggers_count: 0,
      relationship: false,
    };

    // Add to local state
    setTags((prev) => [...prev, newTag]);
  };

  return {
    tags,
    count: tags.length,
    isLoading: false,
    handleTagAdd,
  };
}
