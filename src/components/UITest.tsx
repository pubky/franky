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

  // Selection state
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [selectAllUsers, setSelectAllUsers] = useState(false);
  const [selectAllPosts, setSelectAllPosts] = useState(false);

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
            return await UserController.save(user);
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
            return await PostController.save(post);
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

  // Clear database function
  const handleClearDatabase = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await db.delete();
      await db.open();

      setStats(null);
      setSelectedUsers([]);
      setSelectedPosts([]);
      setSelectAllUsers(false);
      setSelectAllPosts(false);
      logger.debug('Database cleared successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to clear database';
      setError(message);
      logger.error('Failed to clear database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // User selection handlers
  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleSelectAllUsers = (checked: boolean) => {
    setSelectAllUsers(checked);
    if (checked && users) {
      setSelectedUsers(users.map((user) => user.details.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Post selection handlers
  const handlePostSelection = (postId: string, checked: boolean) => {
    if (checked) {
      setSelectedPosts((prev) => [...prev, postId]);
    } else {
      setSelectedPosts((prev) => prev.filter((id) => id !== postId));
    }
  };

  const handleSelectAllPosts = (checked: boolean) => {
    setSelectAllPosts(checked);
    if (checked && posts) {
      setSelectedPosts(posts.map((post) => post.details.id));
    } else {
      setSelectedPosts([]);
    }
  };

  // Bulk delete handlers
  const handleBulkDeleteUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await UserController.bulkDelete(selectedUsers);

      setStats((prev) =>
        prev
          ? {
              ...prev,
              users: prev.users - result.success.length,
            }
          : null,
      );

      setSelectedUsers([]);
      setSelectAllUsers(false);

      if (result.failed.length > 0) {
        setError(`Failed to delete ${result.failed.length} users: ${result.failed.join(', ')}`);
      }

      logger.debug('Bulk delete users completed:', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to bulk delete users';
      setError(message);
      logger.error('Failed to bulk delete users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDeletePosts = async (forceDelete = false) => {
    if (selectedPosts.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      let result: { success: string[]; failed: string[] };

      if (forceDelete) {
        // Force delete by directly removing from database
        result = { success: [], failed: [] };

        await Promise.all(
          selectedPosts.map(async (postId) => {
            try {
              await db.posts.delete(postId);
              result.success.push(postId);
            } catch (error) {
              logger.warn(`Failed to force delete post ${postId}:`, error);
              result.failed.push(postId);
            }
          }),
        );
      } else {
        // Normal delete through controller
        result = await PostController.bulkDelete(selectedPosts as `${string}:${string}`[]);
      }

      setStats((prev) =>
        prev
          ? {
              ...prev,
              posts: prev.posts - result.success.length,
            }
          : null,
      );

      setSelectedPosts([]);
      setSelectAllPosts(false);

      if (result.failed.length > 0) {
        setError(`Failed to delete ${result.failed.length} posts: ${result.failed.join(', ')}`);
      } else if (forceDelete) {
        setError(`Force deleted ${result.success.length} posts (bypassed relationships check)`);
      }

      logger.debug('Bulk delete posts completed:', { result, forceDelete });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to bulk delete posts';
      setError(message);
      logger.error('Failed to bulk delete posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Table rendering functions
  const renderUserTable = () => {
    if (!users) return <div>Loading users...</div>;
    if (users.length === 0) return <div>No users found</div>;

    return (
      <div className="space-y-4">
        {/* Bulk actions - Fixed height container */}
        {selectedUsers.length > 0 && (
          <div className="h-16 flex items-center">
            <div
              className={`w-full transition-all duration-300 ease-in-out ${
                selectedUsers.length > 0
                  ? 'opacity-100 transform translate-y-0'
                  : 'opacity-0 transform -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleBulkDeleteUsers}
                  disabled={isLoading}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:bg-gray-400"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectAllUsers}
                    onChange={(e) => handleSelectAllUsers(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Followers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Following
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posts
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user: User) => (
                <tr key={user.details.id} className={selectedUsers.includes(user.details.id) ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.details.id)}
                      onChange={(e) => handleUserSelection(user.details.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.details.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.details.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                    {user.details.bio}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.details.status || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.counts.followers}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.counts.following}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.counts.posts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPostTable = () => {
    if (!posts) return <div>Loading posts...</div>;
    if (posts.length === 0) return <div>No posts found</div>;

    return (
      <div className="space-y-4">
        {/* Bulk actions - Fixed height container */}
        {selectedPosts.length > 0 && (
          <div className="h-16 flex items-center">
            <div
              className={`w-full transition-all duration-300 ease-in-out ${
                selectedPosts.length > 0
                  ? 'opacity-100 transform translate-y-0'
                  : 'opacity-0 transform -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">
                  {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkDeletePosts(false)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 disabled:bg-gray-400"
                    title="Mark posts with relationships as [DELETED], fully delete posts without relationships"
                  >
                    Delete Selected
                  </button>
                  <button
                    onClick={() => handleBulkDeletePosts(true)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-400"
                    title="Force delete all selected posts from database, bypassing relationships check"
                  >
                    Force Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectAllPosts}
                    onChange={(e) => handleSelectAllPosts(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kind</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Replies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reposts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mentions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sync Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post: Post) => (
                <tr key={post.details.id} className={selectedPosts.includes(post.details.id) ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.details.id)}
                      onChange={(e) => handlePostSelection(post.details.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{post.details.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.details.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                    {post.details.content.length > 50
                      ? `${post.details.content.slice(0, 50)}...`
                      : post.details.content}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.details.kind}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.counts.tags}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.counts.replies}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span>{post.counts.reposts}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-gray-400">
                        {post.relationships.mentioned.length} mention
                        {post.relationships.mentioned.length !== 1 ? 's' : ''}
                      </span>
                      {post.relationships.mentioned.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.relationships.mentioned.slice(0, 3).map((userId) => (
                            <span key={userId} className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                              @{userId}
                            </span>
                          ))}
                          {post.relationships.mentioned.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{post.relationships.mentioned.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.sync_status === 'local'
                          ? 'bg-yellow-100 text-yellow-800'
                          : post.sync_status === 'homeserver'
                            ? 'bg-blue-100 text-blue-800'
                            : post.sync_status === 'nexus'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {post.sync_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Database Management</h2>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">Load Bootstrap Data</h3>
            <p className="text-sm text-gray-600">Load sample data from the Nexus service</p>
            <button
              onClick={handleBootstrap}
              disabled={isLoading}
              className={`
                w-full px-4 py-2 rounded font-medium transition-colors
                ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}
              `}
            >
              {isLoading ? 'Loading...' : 'Load Bootstrap Data'}
            </button>
          </div>

          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">Clear Database</h3>
            <p className="text-sm text-gray-600">Remove all data from the local database</p>
            <button
              onClick={handleClearDatabase}
              disabled={isLoading}
              className={`
                w-full px-4 py-2 rounded font-medium transition-colors
                ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'}
              `}
            >
              {isLoading ? 'Clearing...' : 'Clear Database'}
            </button>
          </div>
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

        {/* Status Display */}
        <div className="min-h-[70px] flex items-center">
          <div
            className={`w-full transition-all duration-300 ease-in-out ${
              stats ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2 pointer-events-none'
            }`}
          >
            {stats && (
              <div className="text-sm text-gray-600 space-y-1 p-3 bg-green-50 rounded-lg">
                <p>✅ Saved {stats.users} users</p>
                <p>✅ Saved {stats.posts} posts</p>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="min-h-[40px] flex items-center">
            <div
              className={`w-full transition-all duration-300 ease-in-out ${
                error ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2 pointer-events-none'
              }`}
            >
              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Users ({users?.length ?? 0})</h3>
          {renderUserTable()}
        </div>

        {/* Posts Table */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Posts ({posts?.length ?? 0})</h3>
          </div>
          {renderPostTable()}
        </div>
      </div>
    </div>
  );
}
