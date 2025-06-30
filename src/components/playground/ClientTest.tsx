'use client';

import { useState } from 'react';
import { Logger, AppError } from '@/libs';
import {
  type SignupResult,
  type PostControllerNewData,
  type UserControllerNewData,
  UserModel,
  AuthController,
  PostController,
  PostModel,
} from '@/core';
import { faker } from '@faker-js/faker';

export function ClientTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedPost, setLastCreatedPost] = useState<PostModel | null>(null);
  const [authStatus, setAuthStatus] = useState<{
    isAuthenticated: boolean;
    user: UserModel | null;
    publicKey: string | null;
    session: SignupResult['session'] | null;
  }>({
    isAuthenticated: false,
    user: null,
    publicKey: null,
    session: null,
  });

  const clearError = () => {
    setError(null);
  };

  const handleSignup = async () => {
    try {
      setIsLoading(true);
      clearError();

      // Generate fake user details using Faker
      const fakeUser: UserControllerNewData = {
        name: faker.person.fullName(),
        bio: faker.person.bio(),
        image: null,
        links: [
          {
            title: faker.company.name(),
            url: faker.internet.url(),
          },
          {
            title: faker.company.catchPhrase(),
            url: faker.internet.url(),
          },
        ],
      };

      const result = await AuthController.signUp(fakeUser);

      // Get the keypair to get the public key
      const keypair = await AuthController.getKeypair();
      const publicKey = keypair?.publicKey().z32() || null;

      // Get the saved user from database
      if (publicKey) {
        try {
          const savedUser = await UserModel.findById(publicKey);
          setAuthStatus({
            isAuthenticated: true,
            user: savedUser,
            publicKey,
            session: result.session,
          });
        } catch {
          // If user not found in DB, use the fake user data with the public key
          setAuthStatus({
            isAuthenticated: true,
            user: { ...fakeUser, id: publicKey } as unknown as UserModel,
            publicKey,
            session: result.session,
          });
        }
      }
    } catch (error) {
      let message = 'Failed to signup';
      if (error instanceof AppError) {
        message = error.message;
      }
      setError(message);
      Logger.error('Failed to signup', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      clearError();

      await AuthController.logout();
      setAuthStatus({
        isAuthenticated: false,
        user: null,
        publicKey: null,
        session: null,
      });

      Logger.debug('Logout successful');
    } catch (error) {
      let message = 'Failed to logout';
      if (error instanceof AppError) {
        message = error.message;
      }
      setError(message);
      Logger.error('Failed to logout', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      setIsLoading(true);
      clearError();

      if (!authStatus.publicKey) {
        throw new Error('User not authenticated');
      }

      // Generate fake post data
      const fakePost: PostControllerNewData = {
        content: faker.lorem.paragraph(),
        indexed_at: Date.now(),
        author: authStatus.publicKey,
        kind: 'short',
        attachments: null,
      };

      const post = await PostController.create(fakePost);

      setLastCreatedPost(post);
    } catch (error) {
      let message = 'Failed to create post';
      if (error instanceof AppError) {
        message = error.message;
      }
      setError(message);
      Logger.error('Failed to create post', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Homeserver</h2>
      <div className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="space-y-4">
          {/* User Profile and Status Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-4">
              {/* Authentication Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status:</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    authStatus.isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {authStatus.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>

              {/* User Profile when authenticated */}
              {authStatus.isAuthenticated && authStatus.user && (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Name:</span>
                    <p className="text-base font-medium text-gray-900">{authStatus.user.details.name}</p>
                  </div>

                  {authStatus.user.details.bio && (
                    <div>
                      <span className="text-sm text-gray-500">Bio:</span>
                      <p className="text-sm text-gray-700">{authStatus.user.details.bio}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm text-gray-500">Public Key:</span>
                    <p className="text-sm font-mono text-gray-900 break-all bg-gray-100 p-2 rounded mt-1">
                      {authStatus.publicKey}
                    </p>
                  </div>

                  {authStatus.user.details.links && authStatus.user.details.links.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500">Links:</span>
                      <ul className="mt-1 space-y-1">
                        {authStatus.user.details.links.map((link, index) => (
                          <li key={index} className="text-sm">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {link.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!authStatus.isAuthenticated ? (
              <button
                onClick={handleSignup}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 transition-colors"
              >
                {isLoading ? 'Signing up...' : 'Sign Up with Random User'}
              </button>
            ) : (
              <div className="w-full space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                >
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
                >
                  {isLoading ? 'Creating post...' : 'Create Random Post'}
                </button>
              </div>
            )}
          </div>

          {/* Last Created Post Display */}
          {lastCreatedPost && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Last Created Post</h3>
              <div className="space-y-2">
                <p className="text-green-700">
                  <strong>Content:</strong> {lastCreatedPost.details.content}
                </p>
                <p className="text-green-700">
                  <strong>ID:</strong> {lastCreatedPost.id}
                </p>
                <p className="text-green-700">
                  <strong>Author:</strong>{' '}
                  <a
                    href={`https://staging.pubky.app/profile/${lastCreatedPost.details.author}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all"
                  >
                    {lastCreatedPost.details.author}
                  </a>
                </p>
                <p className="text-green-700">
                  <strong>Kind:</strong> {lastCreatedPost.details.kind}
                </p>
                <p className="text-green-700">
                  <strong>URI:</strong> <span className="break-all">{lastCreatedPost.details.uri}</span>
                </p>
                <p className="text-green-700">
                  <strong>Staging Link:</strong>{' '}
                  <a
                    href={`https://staging.pubky.app/post/${lastCreatedPost.details.author}/${lastCreatedPost.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all"
                  >
                    {`${lastCreatedPost.id}`}
                  </a>
                </p>
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
        </div>
      </div>
    </div>
  );
}
