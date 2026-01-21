'use client';

import { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { debounce } from 'lodash-es';
import * as Core from '@/core';
import * as Libs from '@/libs';
import type {
  UseSearchAutocompleteParams,
  UseSearchAutocompleteResult,
  AutocompleteTag,
  AutocompleteUserData,
} from './useSearchAutocomplete.types';
import {
  AUTOCOMPLETE_DEBOUNCE_MS,
  AUTOCOMPLETE_TAG_LIMIT,
  AUTOCOMPLETE_USER_LIMIT,
  MIN_USER_ID_SEARCH_LENGTH,
  USER_ID_PREFIXES,
} from './useSearchAutocomplete.constants';

export function useSearchAutocomplete({
  query,
  enabled = true,
}: UseSearchAutocompleteParams): UseSearchAutocompleteResult {
  const [tags, setTags] = useState<AutocompleteTag[]>([]);
  const [userIds, setUserIds] = useState<Core.Pubky[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // Guards against out-of-order async responses overwriting newer results.
  const requestIdRef = useRef(0);

  const userDetailsMap = useLiveQuery(
    async () => {
      if (userIds.length === 0) return new Map<Core.Pubky, Core.NexusUserDetails>();
      return await Core.UserController.getManyDetails({ userIds });
    },
    [userIds],
    new Map<Core.Pubky, Core.NexusUserDetails>(),
  );

  // Transform user details map to AutocompleteUserData array
  // Note: This runs on every render but is fast (O(n) where n is typically small)
  const users: AutocompleteUserData[] = [];
  if (userDetailsMap.size > 0) {
    for (const userId of userIds) {
      const details = userDetailsMap.get(userId);
      if (details) {
        const avatarUrl = details.image ? Core.FileController.getAvatarUrl(details.id) : undefined;
        users.push({
          id: userId,
          name: details.name || 'Unknown User',
          avatarUrl,
        });
      }
    }
  }

  // Debounced search function
  const debouncedSearchRef = useRef(
    debounce(async (searchQuery: string) => {
      const requestId = ++requestIdRef.current;
      setIsSearching(true);

      try {
        // Determine if this is an explicit user ID search (has pk: or pubky prefix)
        const matchedPrefix = USER_ID_PREFIXES.find((prefix) => searchQuery.startsWith(prefix));
        const isExplicitIdSearch = Boolean(matchedPrefix);
        const userIdPrefix = matchedPrefix ? searchQuery.slice(matchedPrefix.length) : searchQuery;

        // Search by user ID if the query (stripped of prefix) is long enough
        // This works for both explicit prefix searches AND raw pubky input
        const shouldSearchUserId = userIdPrefix.length >= MIN_USER_ID_SEARCH_LENGTH;

        // Prepare parallel API calls
        let tagPromise: Promise<string[]> | null = null;
        let userByNamePromise: Promise<string[]> | null = null;
        let userByIdPromise: Promise<string[]> | null = null;

        // Search tags (skip for explicit user ID searches)
        if (!isExplicitIdSearch) {
          tagPromise = Core.SearchController.getTagsByPrefix({
            prefix: searchQuery,
            limit: AUTOCOMPLETE_TAG_LIMIT,
          }).catch((error) => {
            Libs.Logger.error('[useSearchAutocomplete] Failed to fetch tags:', error);
            return [] as string[];
          });
        }

        // Search users by name (skip for explicit user ID searches)
        if (!isExplicitIdSearch) {
          userByNamePromise = Core.SearchController.getUsersByName({
            prefix: searchQuery,
            limit: AUTOCOMPLETE_USER_LIMIT,
          }).catch((error) => {
            Libs.Logger.error('[useSearchAutocomplete] Failed to fetch users by name:', error);
            return [] as string[];
          });
        }

        // Search users by ID (works for explicit prefix or raw pubky input)
        if (shouldSearchUserId) {
          userByIdPromise = Core.SearchController.fetchUsersById({
            prefix: userIdPrefix,
            limit: AUTOCOMPLETE_USER_LIMIT,
          }).catch((error) => {
            Libs.Logger.error('[useSearchAutocomplete] Failed to fetch users by ID:', error);
            return [] as string[];
          });
        }

        // Wait for all promises in parallel
        const [tagResults, nameResults, idResults] = await Promise.all([
          tagPromise || Promise.resolve([]),
          userByNamePromise || Promise.resolve([]),
          userByIdPromise || Promise.resolve([]),
        ]);

        // If a newer request started while we awaited, ignore stale results.
        if (requestId !== requestIdRef.current) {
          return;
        }

        // Process tag results
        const tagSuggestions: AutocompleteTag[] = (tagResults as string[]).map((name) => ({ name }));

        // Update tags immediately
        setTags(tagSuggestions);

        // Combine and deduplicate user results
        const allUserResults = [...(nameResults as string[]), ...(idResults as string[])];
        const uniqueUserIds = Array.from(new Set(allUserResults))
          .map((id) => id as Core.Pubky)
          .slice(0, AUTOCOMPLETE_USER_LIMIT);

        // Update user IDs (useLiveQuery will reactively read details from cache)
        setUserIds(uniqueUserIds);

        // Fetch user details for all users (getOrFetchDetails handles cache check internally)
        if (uniqueUserIds.length > 0) {
          void Promise.all(
            uniqueUserIds.map((userId) =>
              Core.UserController.getOrFetchDetails({ userId }).catch((error) => {
                Libs.Logger.error('[useSearchAutocomplete] Failed to fetch user details:', { userId, error });
              }),
            ),
          );
        }
      } catch (error) {
        Libs.Logger.error('[useSearchAutocomplete] Search failed:', error);
        if (requestId === requestIdRef.current) {
          setTags([]);
          setUserIds([]);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsSearching(false);
        }
      }
    }, AUTOCOMPLETE_DEBOUNCE_MS),
  );

  useEffect(() => {
    // Reset results if disabled or empty query
    if (!enabled || !query.trim()) {
      requestIdRef.current += 1; // invalidate any in-flight request
      setTags([]);
      setUserIds([]);
      setIsSearching(false);
      debouncedSearchRef.current.cancel();
      return;
    }

    // Trigger debounced search
    const debouncedFn = debouncedSearchRef.current;
    debouncedFn(query.trim());

    // Cleanup: cancel pending debounced calls
    return () => {
      debouncedFn.cancel();
    };
  }, [query, enabled]);

  // Loading state: searching OR waiting for user details to load
  const isLoading = isSearching || (userIds.length > 0 && userDetailsMap.size === 0);

  return {
    tags,
    users,
    isLoading,
  };
}
