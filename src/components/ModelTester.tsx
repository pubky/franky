'use client';

import { useState, useEffect } from 'react';
import { userModel } from '@/database/controllers/user';
import { postModel } from '@/database/controllers/post';
import { type UserPK } from '@/database/schemas/user';
import { type PostPK } from '@/database/schemas/post';

const generateRandomId = () => Math.random().toString(36).substring(2, 8);
const generateRandomContent = () => `Test content ${generateRandomId()}`;

export function ModelTester() {
  const [userId, setUserId] = useState<UserPK>('user:initial');
  const [postId, setPostId] = useState<PostPK>('user:initial:post-initial');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const newUserId = `user:${generateRandomId()}` as UserPK;
    setUserId(newUserId);
    setPostId(`${newUserId}:post-${Date.now()}-${generateRandomId()}` as PostPK);
    setIsClient(true);
  }, []);

  // User Operations
  const handleCreateUser = async () => {
    try {
      const newUserId = `user:${generateRandomId()}` as UserPK;
      setUserId(newUserId);

      await userModel.create(newUserId, {
        name: `Test User ${generateRandomId()}`,
        bio: 'Test user for model testing',
        image: 'https://via.placeholder.com/150',
        links: [],
        status: 'Testing',
      });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Post Operations
  const handleCreatePost = async () => {
    try {
      const newPostId = `${userId}:post-${Date.now()}-${generateRandomId()}` as PostPK;
      setPostId(newPostId);

      await postModel.create({
        id: newPostId,
        details: {
          author: userId,
          content: generateRandomContent(),
          kind: 'post',
          uri: `post://${newPostId.split(':')[1]}`,
          attachments: [],
          indexed_at: Date.now(),
        },
        counts: {
          tags: 0,
          unique_tags: 0,
          replies: 0,
          reposts: 0,
        },
        relationships: {
          mentioned: [],
          replied: null,
          repost: null,
        },
        tags: [],
        bookmarked: false,
        indexed_at: null,
        updated_at: Date.now(),
        sync_status: 'local',
        sync_ttl: Date.now() + 3600000,
      });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await postModel.delete(postId);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Tag Operations
  const handleAddTag = async () => {
    try {
      const tagLabel = `tag-${generateRandomId()}`;
      await postModel.tag('PUT', userId, postId, tagLabel);
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleRemoveTag = async () => {
    try {
      const post = await postModel.getPost(postId);
      if (post && post.tags && post.tags.length > 0) {
        const tagToRemove = post.tags[0].label;
        await postModel.tag('DEL', userId, postId, tagToRemove);
      }
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  // Reply Operations
  const handleAddReply = async () => {
    try {
      await postModel.reply(postId, generateRandomContent());
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  // Bookmark Operations
  const handleBookmark = async () => {
    try {
      await postModel.bookmark('PUT', userId, postId);
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  const handleUnbookmark = async () => {
    try {
      await postModel.bookmark('DEL', userId, postId);
    } catch (error) {
      console.error('Error unbookmarking post:', error);
    }
  };

  // Repost Operations
  const handleRepost = async () => {
    try {
      await postModel.repost(postId, generateRandomContent());
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

  if (!isClient) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3 mt-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Model Testing Interface</h2>
        <p className="text-sm text-gray-600">
          Current User ID: <span className="font-mono">{userId}</span>
        </p>
        <p className="text-sm text-gray-600">
          Current Post ID: <span className="font-mono">{postId}</span>
        </p>

        {/* User Section */}
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold">Users</h3>
          <div className="flex gap-2">
            <button onClick={handleCreateUser} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Create New User
            </button>
          </div>
        </div>

        {/* Post Section */}
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold">Posts</h3>
          <div className="flex gap-2">
            <button onClick={handleCreatePost} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Create New Post
            </button>
            <button onClick={handleDeletePost} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Delete Post
            </button>
          </div>
        </div>

        {/* Tags Section */}
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold">Tags</h3>
          <div className="flex gap-2">
            <button onClick={handleAddTag} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add Random Tag
            </button>
            <button onClick={handleRemoveTag} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Remove First Tag
            </button>
          </div>
        </div>

        {/* Replies Section */}
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold">Replies</h3>
          <div className="flex gap-2">
            <button onClick={handleAddReply} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add Random Reply
            </button>
          </div>
        </div>

        {/* Bookmarks Section */}
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold">Bookmarks</h3>
          <div className="flex gap-2">
            <button onClick={handleBookmark} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Bookmark Post
            </button>
            <button onClick={handleUnbookmark} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Remove Bookmark
            </button>
          </div>
        </div>

        {/* Reposts Section */}
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold">Reposts</h3>
          <div className="flex gap-2">
            <button onClick={handleRepost} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add Random Repost
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
