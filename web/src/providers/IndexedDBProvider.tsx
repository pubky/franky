'use client';

import { useEffect } from 'react';
import { db } from '../models/database';

export function IndexedDBProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initDB = async () => {
      try {
        // Create or update a test user
        await db.users.put({
          id: 'franky',
          indexed_at: Date.now(),
          updated_at: Date.now(),
          sync_status: 'local',
          sync_ttl: Date.now() + 3600000, // 1 hour
          details: {
            name: 'Franky',
            bio: 'Hey, I\'m Franky',
            image: '',
            links: [],
            status: ''
          },
          counts: {
            posts: 0,
            replies: 0,
            tagged: 0,
            follower: 0,
            following: 0,
            friends: 0,
            tags: 0,
            unique_tags: 0,
            bookmarks: 0
          },
          relationship: {
            followed_by: false,
            following: false,
            muted: false
          },
          followers: [],
          following: [],
          tags: [],
          mutes: []
        });
        console.log('IndexedDB initialized and test data created/updated:', db);
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
      }
    };

    initDB();
  }, []);

  return <>{children}</>;
} 