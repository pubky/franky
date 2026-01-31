 'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { TAGGERS_PAGE_SIZE } from './usePostTaggers.constants';
import type { TaggersStateMap, UsePostTaggersResult } from './usePostTaggers.types';

 /**
  * Fetch full tagger lists for post tags on demand.
  * Keeps results in-memory per hook instance.
  */
 export function usePostTaggers(postId?: string | null): UsePostTaggersResult {
  const [taggerStates, setTaggerStates] = useState<TaggersStateMap>(new Map());

  const statesRef = useRef(taggerStates);

   useEffect(() => {
    statesRef.current = taggerStates;
  }, [taggerStates]);

  useEffect(() => {
    setTaggerStates(new Map());
  }, [postId]);

  const fetchAllTaggers = useCallback(
    async (label: string, initialIds: Core.Pubky[], totalCount?: number) => {
      if (!postId) return;
      const labelKey = label.toLowerCase();
      const existing = statesRef.current.get(labelKey);
      if (existing?.isLoading) return;
      if (existing && existing.totalCount !== undefined && existing.ids.length >= existing.totalCount) {
        return;
      }

      setTaggerStates((prev) => {
        const next = new Map(prev);
        next.set(labelKey, {
          ids: initialIds,
          skip: initialIds.length,
          isLoading: true,
          hasMore: totalCount ? initialIds.length < totalCount : true,
          totalCount,
        });
        return next;
      });

       try {
        let skip = initialIds.length;
        let collectedIds = [...initialIds];
        let hasMore = true;
        while (hasMore) {
          const response = await Core.PostController.fetchTaggers({
            compositeId: postId,
            label,
            skip,
            limit: TAGGERS_PAGE_SIZE,
          });

          const normalized = Array.isArray(response) ? response : [response];
          const pageTaggers = normalized.flatMap((entry) => entry.users ?? []) as Core.Pubky[];
          if (pageTaggers.length === 0) break;

          const uniqueBefore = new Set(collectedIds).size;
          collectedIds = Array.from(new Set([...collectedIds, ...pageTaggers])) as Core.Pubky[];
          const uniqueAfter = new Set(collectedIds).size;
          if (uniqueAfter === uniqueBefore) break;

          skip += pageTaggers.length;

          if (totalCount !== undefined) {
            hasMore = collectedIds.length < totalCount;
          } else if (pageTaggers.length < TAGGERS_PAGE_SIZE) {
            hasMore = false;
          }
        }

        setTaggerStates((prev) => {
          const next = new Map(prev);
          const existing = next.get(labelKey);
          if (!existing) return prev;
          next.set(labelKey, {
            ...existing,
            ids: collectedIds,
            skip,
            isLoading: false,
            hasMore: false,
          });
          return next;
        });
       } catch (error) {
         Libs.Logger.error('[usePostTaggers] Failed to fetch taggers', { postId, label, error });
        setTaggerStates((prev) => {
          const next = new Map(prev);
          const existing = next.get(labelKey);
          if (!existing) return prev;
          next.set(labelKey, { ...existing, isLoading: false, hasMore: false });
          return next;
        });
       }
     },
    [postId],
   );

  const taggersByLabel = useMemo(() => {
    const map = new Map<string, Core.Pubky[]>();
    taggerStates.forEach((value, key) => {
      map.set(key, value.ids);
    });
    return map;
  }, [taggerStates]);

   return {
     taggersByLabel,
    taggerStates,
    fetchAllTaggers,
   };
 }
