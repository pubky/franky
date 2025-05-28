'use client';

import { useState } from 'react';
import { UserController } from '@/database/controllers/user';
import { PostController } from '@/database/controllers/post';
import { nexusService } from '@/services/nexus';
import { logger } from '@/lib/logger';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/database';
import { type User } from '@/database/schemas/user';
import { type Post } from '@/database/schemas/post';

export function UITestes() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ users: number; posts: number } | null>(null);

  // Live queries for users and posts
  const users = useLiveQuery(() => db.users.toArray());
  const posts = useLiveQuery(() => db.posts.toArray());

  // Live counts
  const userCount = useLiveQuery(() => db.users.count());
  const postCount = useLiveQuery(() => db.posts.count());

  const handleBootstrap = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStats(null);

      // Fetch data from bootstrap endpoint
      const bootstrapData = await nexusService.bootstrap('7oognktdczbpf17qt94u7537n5i6xcacks9twtf39mxsm5o53ogo');

      // Save users
      const savedUsers = await Promise.all(
        bootstrapData.users.map(async (user) => {
          try {
            return await UserController.createOrUpdate(user);
          } catch (error) {
            logger.error('Failed to save user:', error);
            return null;
          }
        }),
      );

      // Save posts
      const savedPosts = await Promise.all(
        bootstrapData.posts.map(async (post) => {
          try {
            return await PostController.createOrUpdate(post);
          } catch (error) {
            logger.error('Failed to save post:', error);
            return null;
          }
        }),
      );

      // Update stats
      setStats({
        users: savedUsers.filter(Boolean).length,
        posts: savedPosts.filter(Boolean).length,
      });

      logger.debug('Bootstrap data saved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to bootstrap data';
      setError(message);
      logger.error('Failed to bootstrap data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Table rendering functions
  const renderUserTable = () => {
    if (!users) return <div>Loading users...</div>;
    if (users.length === 0) return <div>No users found</div>;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Followers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Following
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user: User) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.details.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.details.bio}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.details.status || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.counts.followers}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.counts.following}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPostTable = () => {
    if (!posts) return <div>Loading posts...</div>;
    if (posts.length === 0) return <div>No posts found</div>;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kind</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Replies
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post: Post) => (
              <tr key={post.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{post.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.details.author}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {post.details.content.length > 50 ? `${post.details.content.slice(0, 50)}...` : post.details.content}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.details.kind}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.counts.tags}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.counts.replies}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Bootstrap Data Loader</h2>

        {/* Status Display */}
        {stats && (
          <div className="text-sm text-gray-600 space-y-1">
            <p>Saved {stats.users} users</p>
            <p>Saved {stats.posts} posts</p>
          </div>
        )}

        {/* Error Display */}
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

        {/* Bootstrap Button */}
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
          <button
            onClick={handleBootstrap}
            disabled={isLoading}
            className={`
              w-full px-4 py-2 rounded font-medium
              ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}
            `}
          >
            {isLoading ? 'Loading...' : 'Load Bootstrap Data'}
          </button>
        </div>

        {/* Database Stats */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{userCount ?? 0}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{postCount ?? 0}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Total Posts</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Users</h3>
          {renderUserTable()}
        </div>

        {/* Posts Table */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Posts</h3>
          {renderPostTable()}
        </div>
      </div>
    </div>
  );
}
