'use client';

import { useState, useCallback } from 'react';
import { UserController } from '@/database/controllers/user';
import { PostController } from '@/database/controllers/post';
import { NexusService } from '@/services/nexus';
import { Logger } from '@/lib/logger';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/database';
import { type User } from '@/database/schemas/user';
import { type Post } from '@/database/schemas/post';
import { type PostPK, type UserPK } from '@/database/types';
import { AppError, CommonErrorType } from '@/lib/error';

interface Stats {
  users: number;
  posts: number;
}

interface BulkActionResult {
  success: number;
  failed: number;
}

export function UITestes() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  // Selection state
  const [selectedUsers, setSelectedUsers] = useState<UserPK[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<PostPK[]>([]);
  const [selectAllUsers, setSelectAllUsers] = useState(false);
  const [selectAllPosts, setSelectAllPosts] = useState(false);

  // Live queries for users and posts
  const users = useLiveQuery(() => db.users.toArray());
  const posts = useLiveQuery(() => db.posts.toArray());

  // Live counts
  const userCount = useLiveQuery(() => db.users.count());
  const postCount = useLiveQuery(() => db.posts.count());

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleBootstrap = async () => {
    try {
      setIsLoading(true);
      clearError();
      setStats(null);

      // Fetch data from bootstrap endpoint
      const bootstrapData = await NexusService.bootstrap('7oognktdczbpf17qt94u7537n5i6xcacks9twtf39mxsm5o53ogo');

      // Use optimized bulk operations
      const [savedUsers, savedPosts] = await Promise.allSettled([
        UserController.bulkSave(bootstrapData.users),
        PostController.bulkSave(bootstrapData.posts),
      ]);

      const usersResult = savedUsers.status === 'fulfilled' ? savedUsers.value : [];
      const postsResult = savedPosts.status === 'fulfilled' ? savedPosts.value : [];

      // Update stats
      setStats({
        users: usersResult.length,
        posts: postsResult.length,
      });

      Logger.debug('Bootstrap data saved successfully', {
        users: usersResult.length,
        posts: postsResult.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to bootstrap data';
      setError(message);
      Logger.error('Failed to bootstrap data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDatabase = async () => {
    try {
      setIsLoading(true);
      clearError();

      await db.delete();
      await db.open();

      // Reset state
      setStats(null);
      setSelectedUsers([]);
      setSelectedPosts([]);
      setSelectAllUsers(false);
      setSelectAllPosts(false);

      Logger.debug('Database cleared successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to clear database';
      setError(message);
      Logger.error('Failed to clear database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // User selection handlers
  const handleUserSelection = useCallback((userId: UserPK, checked: boolean) => {
    setSelectedUsers((prev) => (checked ? [...prev, userId] : prev.filter((id) => id !== userId)));
  }, []);

  const handleSelectAllUsers = useCallback(
    (checked: boolean) => {
      setSelectAllUsers(checked);
      setSelectedUsers(checked && users ? users.map((user) => user.details.id) : []);
    },
    [users],
  );

  // Post selection handlers
  const handlePostSelection = useCallback((postId: PostPK, checked: boolean) => {
    setSelectedPosts((prev) => (checked ? [...prev, postId] : prev.filter((id) => id !== postId)));
  }, []);

  const handleSelectAllPosts = useCallback(
    (checked: boolean) => {
      setSelectAllPosts(checked);
      setSelectedPosts(checked && posts ? posts.map((post) => post.details.id) : []);
    },
    [posts],
  );

  // Bulk delete handlers
  const handleBulkDeleteUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setIsLoading(true);
      clearError();

      await UserController.bulkDelete(selectedUsers);

      // Reset selection
      setSelectedUsers([]);
      setSelectAllUsers(false);

      Logger.debug('Bulk delete users completed:', selectedUsers.length);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to bulk delete users';
      setError(message);
      Logger.error('Failed to bulk delete users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDeletePosts = async (forceDelete = false) => {
    if (selectedPosts.length === 0) return;

    try {
      setIsLoading(true);
      clearError();

      let result: BulkActionResult;

      if (forceDelete) {
        // Force delete by directly removing from database
        result = { success: 0, failed: 0 };

        await Promise.allSettled(
          selectedPosts.map(async (postId) => {
            try {
              await db.posts.delete(postId);
              result.success++;
            } catch (error) {
              Logger.warn(`Failed to force delete post ${postId}:`, error);
              result.failed++;
            }
          }),
        );
      } else {
        // Normal delete through controller (smart deletion)
        await PostController.bulkDelete(selectedPosts);
        result = { success: selectedPosts.length, failed: 0 };
      }

      // Reset selection
      setSelectedPosts([]);
      setSelectAllPosts(false);

      // Show feedback message
      if (result.failed > 0) {
        setError(`Successfully processed ${result.success} posts, failed: ${result.failed}`);
      }

      Logger.debug('Bulk delete posts completed:', {
        total: selectedPosts.length,
        result,
        forceDelete,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to bulk delete posts';
      setError(message);
      Logger.error('Failed to bulk delete posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Table rendering functions
  const renderUserTable = () => {
    if (!users) return <div className="text-center py-4">Loading users...</div>;
    if (users.length === 0) return <div className="text-center py-4 text-gray-500">No users found</div>;

    return (
      <div className="space-y-4">
        {/* Bulk actions */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm text-blue-700 font-medium">
              {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleBulkDeleteUsers}
              disabled={isLoading}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:bg-gray-400 transition-colors"
            >
              Delete Selected
            </button>
          </div>
        )}

        <div className="overflow-x-auto border rounded-lg">
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
                <tr
                  key={user.details.id}
                  className={`hover:bg-gray-50 ${selectedUsers.includes(user.details.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.details.id)}
                      onChange={(e) => handleUserSelection(user.details.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 max-w-[200px] truncate"
                    title={user.details.id}
                  >
                    {user.details.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{user.details.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={user.details.bio}>
                    {user.details.bio || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.details.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.details.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {user.counts.followers.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {user.counts.following.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {user.counts.posts.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPostTable = () => {
    if (!posts) return <div className="text-center py-4">Loading posts...</div>;
    if (posts.length === 0) return <div className="text-center py-4 text-gray-500">No posts found</div>;

    return (
      <div className="space-y-4">
        {/* Bulk actions */}
        {selectedPosts.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm text-blue-700 font-medium">
              {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkDeletePosts(false)}
                disabled={isLoading}
                className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 disabled:bg-gray-400 transition-colors"
                title="Smart deletion: marks posts with relationships as [DELETED], fully deletes posts without relationships"
              >
                Smart Delete
              </button>
              <button
                onClick={() => handleBulkDeletePosts(true)}
                disabled={isLoading}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                title="Force delete all selected posts from database, bypassing relationships check"
              >
                Force Delete
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto border rounded-lg">
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
                  Mentions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sync Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post: Post) => (
                <tr
                  key={post.details.id}
                  className={`hover:bg-gray-50 ${selectedPosts.includes(post.details.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.details.id)}
                      onChange={(e) => handlePostSelection(post.details.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 max-w-[200px] truncate"
                    title={post.details.id}
                  >
                    {post.details.id}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[150px] truncate"
                    title={post.details.author}
                  >
                    {post.details.author}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="max-w-xs truncate" title={post.details.content}>
                      {post.details.content === '[DELETED]' ? (
                        <span className="text-red-500 italic">[DELETED]</span>
                      ) : post.details.content.length > 80 ? (
                        `${post.details.content.slice(0, 80)}...`
                      ) : (
                        post.details.content
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {post.details.kind}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{post.counts.tags}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.relationships.mentioned.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {post.relationships.mentioned.slice(0, 2).map((userId) => (
                          <span key={userId} className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                            @{userId.slice(-8)}
                          </span>
                        ))}
                        {post.relationships.mentioned.length > 2 && (
                          <span className="text-xs text-gray-400">+{post.relationships.mentioned.length - 2}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
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
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Database Management</h2>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Load Bootstrap Data</h3>
            <p className="text-sm text-gray-600 mb-4">Load sample data from the Nexus service</p>
            <button
              onClick={handleBootstrap}
              disabled={isLoading}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isLoading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isLoading ? 'Loading...' : 'Load Bootstrap Data'}
            </button>
          </div>

          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Clear Database</h3>
            <p className="text-sm text-gray-600 mb-4">Remove all data from the local database and reset state</p>
            <button
              onClick={handleClearDatabase}
              disabled={isLoading}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isLoading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isLoading ? 'Clearing...' : 'Clear Database'}
            </button>
          </div>

          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Test Error Page</h3>
            <p className="text-sm text-gray-600 mb-4">Trigger an error to test the error handling</p>
            <button
              onClick={() => {
                throw new AppError(CommonErrorType.UNEXPECTED_ERROR, 'This is a test error from UI', 500);
              }}
              className="w-full px-4 py-2 rounded-lg font-medium transition-colors bg-orange-500 hover:bg-orange-600 text-white"
            >
              Trigger Error
            </button>
          </div>
        </div>

        {/* Database Stats */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-6 text-center shadow-sm">
            <div className="text-4xl font-bold text-blue-600 mb-2">{userCount?.toLocaleString() ?? 0}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">Total Users</div>
          </div>
          <div className="bg-white border rounded-lg p-6 text-center shadow-sm">
            <div className="text-4xl font-bold text-blue-600 mb-2">{postCount?.toLocaleString() ?? 0}</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide font-medium">Total Posts</div>
          </div>
        </div>

        {/* Success Message */}
        {stats && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-green-600 text-sm">
                <div className="font-medium mb-1">✅ Bootstrap completed successfully!</div>
                <div>
                  Saved {stats.users.toLocaleString()} users and {stats.posts.toLocaleString()} posts
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-red-600 text-sm">{error}</div>
              <button onClick={clearError} className="text-red-600 hover:text-red-800 text-sm font-medium">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Users Section */}
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-gray-900">Users ({users?.length.toLocaleString() ?? 0})</h3>
          {renderUserTable()}
        </div>

        {/* Posts Section */}
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-gray-900">Posts ({posts?.length.toLocaleString() ?? 0})</h3>
          {renderPostTable()}
        </div>
      </div>
    </div>
  );
}
