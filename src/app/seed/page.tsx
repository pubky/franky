'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Core from '@/core';

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedResult(null);

    try {
      // Initialize database
      await Core.db.initialize();

      // Sample post data (main posts + replies)
      const samplePosts = [
        {
          id: 'post-1',
          content: 'Welcome to the new post system! 🚀 This is a sample post to demonstrate the migration from PostMock to real post tables. The system now uses normalized tables for better data organization and performance.',
          author: 'alice',
          kind: 'short' as Core.NexusPostKind,
          uri: 'post://alice/post-1',
          attachments: [],
          indexed_at: Date.now(),
        },
        {
          id: 'post-2',
          content: 'Just shipped a new feature! The tag system is now fully integrated with the database. Users can add and remove tags in real-time. Really excited about the improved user experience! ✨',
          author: 'bob',
          kind: 'short' as Core.NexusPostKind,
          uri: 'post://bob/post-2',
          attachments: [],
          indexed_at: Date.now() - 300000, // 5 minutes ago
        },
        {
          id: 'post-3',
          content: 'Working on some exciting new features for the decentralized social network. Privacy and user control are at the forefront of everything we build. 🔒',
          author: 'charlie',
          kind: 'short' as Core.NexusPostKind,
          uri: 'post://charlie/post-3',
          attachments: [],
          indexed_at: Date.now() - 600000, // 10 minutes ago
        },
        // Reply posts
        {
          id: 'reply-1-1',
          content: 'This is amazing! The normalized table approach is definitely the way to go. Much better than the old mock system. 👏',
          author: 'jane',
          kind: 'short' as Core.NexusPostKind,
          uri: 'post://jane/reply-1-1',
          attachments: [],
          indexed_at: Date.now() - 120000, // 2 minutes ago
        },
        {
          id: 'reply-1-2',
          content: 'Completely agree! The performance improvements are noticeable. Great work on this migration.',
          author: 'david',
          kind: 'short' as Core.NexusPostKind,
          uri: 'post://david/reply-1-2',
          attachments: [],
          indexed_at: Date.now() - 60000, // 1 minute ago
        },
        {
          id: 'reply-2-1',
          content: 'Love the real-time tagging! This makes the user experience so much smoother. 🎉',
          author: 'emma',
          kind: 'short' as Core.NexusPostKind,
          uri: 'post://emma/reply-2-1',
          attachments: [],
          indexed_at: Date.now() - 180000, // 3 minutes ago
        }
      ];

      // Sample tags data
      const sampleTags = [
        {
          id: 'post-1',
          tags: [
            {
              label: 'migration',
              taggers: ['user-1', 'user-2'],
              taggers_count: 2,
              relationship: false,
            },
            {
              label: 'database',
              taggers: ['user-3'],
              taggers_count: 1,
              relationship: false,
            }
          ]
        },
        {
          id: 'post-2',
          tags: [
            {
              label: 'development',
              taggers: ['user-1'],
              taggers_count: 1,
              relationship: false,
            },
            {
              label: 'ui-ux',
              taggers: ['user-2', 'user-4'],
              taggers_count: 2,
              relationship: false,
            }
          ]
        },
        {
          id: 'post-3',
          tags: [
            {
              label: 'privacy',
              taggers: ['user-1', 'user-2', 'user-3'],
              taggers_count: 3,
              relationship: false,
            },
            {
              label: 'decentralization',
              taggers: ['user-4'],
              taggers_count: 1,
              relationship: false,
            }
          ]
        }
      ];

      // Sample counts data
      const sampleCounts = [
        {
          id: 'post-1',
          tags: 2,
          unique_tags: 2,
          replies: 2, // Updated to reflect actual replies
          reposts: 2,
        },
        {
          id: 'post-2',
          tags: 3,
          unique_tags: 2,
          replies: 1, // Updated to reflect actual replies
          reposts: 4,
        },
        {
          id: 'post-3',
          tags: 4,
          unique_tags: 2,
          replies: 0, // Updated to reflect actual replies
          reposts: 1,
        },
        // Reply post counts
        {
          id: 'reply-1-1',
          tags: 0,
          unique_tags: 0,
          replies: 0,
          reposts: 0,
        },
        {
          id: 'reply-1-2',
          tags: 0,
          unique_tags: 0,
          replies: 0,
          reposts: 0,
        },
        {
          id: 'reply-2-1',
          tags: 0,
          unique_tags: 0,
          replies: 0,
          reposts: 1,
        }
      ];

      // Sample relationships data (including reply relationships)
      const sampleRelationships = [
        {
          id: 'post-1',
          replied: null,
          reposted: null,
          mentioned: ['@developers'],
        },
        {
          id: 'post-2',
          replied: null,
          reposted: null,
          mentioned: ['@users'],
        },
        {
          id: 'post-3',
          replied: null,
          reposted: null,
          mentioned: [],
        },
        // Reply relationships
        {
          id: 'reply-1-1',
          replied: 'post-1', // This is a reply to post-1
          reposted: null,
          mentioned: ['@alice'],
        },
        {
          id: 'reply-1-2',
          replied: 'post-1', // This is a reply to post-1
          reposted: null,
          mentioned: ['@alice'],
        },
        {
          id: 'reply-2-1',
          replied: 'post-2', // This is a reply to post-2
          reposted: null,
          mentioned: ['@bob'],
        }
      ];

      // Clear existing data first
      console.log('🧹 Clearing existing data...');
      await Core.PostDetailsModel.table.clear();
      await Core.PostTagsModel.table.clear();
      await Core.PostCountsModel.table.clear();
      await Core.PostRelationshipsModel.table.clear();

      // Insert sample data
      console.log('📝 Inserting sample posts...');
      await Core.PostDetailsModel.table.bulkAdd(samplePosts);

      console.log('🏷️ Inserting sample tags...');
      await Core.PostTagsModel.table.bulkAdd(sampleTags);

      console.log('📊 Inserting sample counts...');
      await Core.PostCountsModel.table.bulkAdd(sampleCounts);

      console.log('🔗 Inserting sample relationships...');
      await Core.PostRelationshipsModel.table.bulkAdd(sampleRelationships);

      setSeedResult(`✅ Database seeding completed successfully!
        - ${samplePosts.length} posts inserted (3 main posts + 3 replies)
        - ${sampleTags.length} tag collections inserted
        - ${sampleCounts.length} count records inserted
        - ${sampleRelationships.length} relationship records inserted`);

    } catch (error) {
      console.error('❌ Error seeding database:', error);
      setSeedResult(`❌ Error seeding database: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClear = async () => {
    setIsSeeding(true);
    setSeedResult(null);

    try {
      await Core.db.initialize();

      console.log('🧹 Clearing all data...');
      await Core.PostDetailsModel.table.clear();
      await Core.PostTagsModel.table.clear();
      await Core.PostCountsModel.table.clear();
      await Core.PostRelationshipsModel.table.clear();

      setSeedResult('🧹 Database cleared successfully!');
    } catch (error) {
      console.error('❌ Error clearing database:', error);
      setSeedResult(`❌ Error clearing database: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Atoms.Container className="max-w-4xl mx-auto p-6">
      <Atoms.Container className="mb-8">
        <Atoms.Typography size="2xl" className="font-bold mb-4">
          Database Seeding Tool
        </Atoms.Typography>
        <Atoms.Typography className="text-muted-foreground mb-6">
          This tool helps you populate the IndexedDB with sample data for development and testing.
        </Atoms.Typography>
      </Atoms.Container>

      <Atoms.Container className="flex gap-4 mb-8">
        <Atoms.Button
          onClick={handleSeed}
          disabled={isSeeding}
          className="flex items-center gap-2"
        >
          {isSeeding ? '🌱 Seeding...' : '🌱 Seed Database'}
        </Atoms.Button>

        <Atoms.Button
          onClick={handleClear}
          disabled={isSeeding}
          variant="destructive"
          className="flex items-center gap-2"
        >
          {isSeeding ? '🧹 Clearing...' : '🧹 Clear Database'}
        </Atoms.Button>
      </Atoms.Container>

      {seedResult && (
        <Atoms.Card className="p-4">
          <pre className="whitespace-pre-wrap text-sm">{seedResult}</pre>
        </Atoms.Card>
      )}

      <Atoms.Container className="mt-8">
        <Atoms.Typography size="lg" className="font-semibold mb-4">
          What this does:
        </Atoms.Typography>
        <Atoms.Container className="space-y-2 text-sm text-muted-foreground">
          <Atoms.Typography>• Creates 3 sample posts with realistic content</Atoms.Typography>
          <Atoms.Typography>• Adds tags to each post (migration, database, development, etc.)</Atoms.Typography>
          <Atoms.Typography>• Includes sample counts (replies, reposts, tag counts)</Atoms.Typography>
          <Atoms.Typography>• Sets up relationships and mentions</Atoms.Typography>
          <Atoms.Typography>• Uses proper normalized table structure</Atoms.Typography>
        </Atoms.Container>
      </Atoms.Container>

      <Atoms.Container className="mt-6 p-4 border border-amber-200 bg-amber-50 rounded-lg">
        <Atoms.Typography className="text-amber-800 text-sm">
          <strong>Note:</strong> After seeding, visit <code>/feed</code> to see the sample posts and test the tag functionality.
        </Atoms.Typography>
      </Atoms.Container>
    </Atoms.Container>
  );
}