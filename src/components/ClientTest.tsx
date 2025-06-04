'use client';

import { useState } from 'react';
import { homeserverService } from '@/services/homeserver';
import { Logger } from '@/lib/logger';
import type { SignupResult } from '@/services/homeserver/types';
import { AppError, createCommonError, CommonErrorType } from '@/lib/error';

export default function ClientTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupToken, setSignupToken] = useState<string | null>(null);
  const [homeserverStatus, setHomeserverStatus] = useState<{
    isAuthenticated: boolean;
    publicKey: string | null;
    session: SignupResult['session'] | null;
  }>({
    isAuthenticated: false,
    publicKey: null,
    session: null,
  });

  const clearError = () => {
    setError(null);
  };

  const handleGenerateKeypair = async () => {
    try {
      setIsLoading(true);
      clearError();

      const keypair = homeserverService.generateRandomKeypair();
      if (!keypair) {
        throw createCommonError(CommonErrorType.INVALID_INPUT, 'Failed to generate keypair', 400);
      }
      const publicKey = keypair.publicKey().z32();
      const secretKey = keypair.secretKey().toString();

      setHomeserverStatus((prev) => ({
        ...prev,
        publicKey,
      }));

      Logger.debug('Generated new keypair:', { publicKey, secretKey });
    } catch (error) {
      let message = 'Failed to generate keypair';
      if (error instanceof AppError) {
        message = error.message;
      }
      setError(message);
      Logger.error('Failed to generate keypair:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSignupToken = async () => {
    try {
      setIsLoading(true);
      clearError();

      Logger.debug('Generating signup token...');
      const response = await fetch('https://admin.homeserver.staging.pubky.app/generate_signup_token', {
        method: 'GET',
        headers: {
          'X-Admin-Password': 'voyage tuition cabin arm stock guitar soon salute',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        Logger.error('Failed to generate signup token:', { status: response.status, error: errorText });
        throw createCommonError(
          CommonErrorType.NETWORK_ERROR,
          `Failed to generate signup token: ${response.status} ${errorText}`,
          response.status,
        );
      }

      const token = (await response.text()).trim();
      if (!token) {
        Logger.error('No token in response');
        throw createCommonError(CommonErrorType.UNEXPECTED_ERROR, 'No token received from server', 500);
      }

      setSignupToken(token);
      Logger.debug('Generated signup token:', token);
    } catch (error) {
      let message = 'Failed to generate signup token';
      if (error instanceof AppError) {
        message = error.message;
      }
      setError(message);
      Logger.error('Failed to generate signup token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    try {
      setIsLoading(true);
      clearError();

      const keypair = homeserverService.getCurrentKeypair();
      if (!keypair) {
        throw createCommonError(CommonErrorType.INVALID_INPUT, 'No keypair available. Generate one first.', 400);
      }

      if (!signupToken) {
        throw createCommonError(CommonErrorType.INVALID_INPUT, 'No signup token available. Generate one first.', 400);
      }

      const result = await homeserverService.signup(keypair, signupToken);
      setHomeserverStatus((prev) => ({
        ...prev,
        isAuthenticated: true,
        session: result.session,
      }));

      Logger.debug('Signup successful:', result);
    } catch (error) {
      let message = 'Failed to signup';
      if (error instanceof AppError) {
        message = error.message;
      }
      setError(message);
      Logger.error('Failed to signup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      clearError();

      const publicKey = homeserverService.getCurrentPublicKey();
      if (!publicKey) {
        throw createCommonError(CommonErrorType.INVALID_INPUT, 'No active session to logout', 400);
      }

      await homeserverService.logout(publicKey);
      setHomeserverStatus({
        isAuthenticated: false,
        publicKey: null,
        session: null,
      });
      setSignupToken(null);

      Logger.debug('Logout successful');
    } catch (error) {
      let message = 'Failed to logout';
      if (error instanceof AppError) {
        message = error.message;
      }
      setError(message);
      Logger.error('Failed to logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Homeserver</h2>
      <div className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="space-y-4">
          {/* Status Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <span className="text-sm text-gray-500">Status:</span>
                <span
                  className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    homeserverStatus.isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {homeserverStatus.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>
              {homeserverStatus.publicKey && (
                <div>
                  <span className="text-sm text-gray-500">Public Key:</span>
                  <span className="ml-2 text-sm font-mono text-gray-900 text-wrap break-all">
                    {homeserverStatus.publicKey}
                  </span>
                </div>
              )}
              {signupToken && (
                <div>
                  <span className="text-sm text-gray-500">Signup Token:</span>
                  <span className="ml-2 text-sm font-mono text-gray-900 text-wrap break-all">{signupToken}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerateKeypair}
              disabled={isLoading || homeserverStatus.isAuthenticated}
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            >
              Generate Keypair
            </button>
            <button
              onClick={handleGenerateSignupToken}
              disabled={isLoading || !!signupToken}
              className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
            >
              Generate Signup Token
            </button>
            <button
              onClick={handleSignup}
              disabled={isLoading || !homeserverStatus.publicKey || !signupToken || homeserverStatus.isAuthenticated}
              className="w-full sm:w-auto px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 transition-colors"
            >
              Signup
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoading || !homeserverStatus.isAuthenticated}
              className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors"
            >
              Logout
            </button>
          </div>

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
