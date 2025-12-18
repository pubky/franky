import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Session, Keypair, PublicKey } from '@synonymdev/pubky';
import * as Core from '@/core';
import * as Libs from '@/libs';

// =============================================================================
// HOISTED MOCKS - Must be hoisted to run before module imports
// =============================================================================

const mockState = vi.hoisted(() => ({
  // Signer methods
  signup: vi.fn(),
  signin: vi.fn(),
  publishHomeserverForce: vi.fn(),
  // Session methods
  sessionSignout: vi.fn(),
  // Session storage
  sessionStorageGet: vi.fn(),
  sessionStoragePutJson: vi.fn(),
  sessionStoragePutBytes: vi.fn(),
  sessionStorageDelete: vi.fn(),
  // Client methods
  clientFetch: vi.fn(),
  // Public storage
  publicStorageGet: vi.fn(),
  publicStorageList: vi.fn(),
  // Pubky methods
  getHomeserverOf: vi.fn(),
  startAuthFlow: vi.fn(),
  authFlowKindSignin: vi.fn(),
}));

// Mock global fetch for generateSignupToken tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock pubky-app-specs to avoid WebAssembly issues
vi.mock('pubky-app-specs', () => ({
  default: vi.fn(() => Promise.resolve()),
}));

// Mock Logger to suppress console output during tests
vi.mock('@/libs/logger', () => ({
  Logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// =============================================================================
// MOCK @synonymdev/pubky MODULE
// =============================================================================

vi.mock('@synonymdev/pubky', () => {
  const createMockPubkyInstance = () => ({
    getHomeserverOf: (...args: unknown[]) => mockState.getHomeserverOf(...args),
    startAuthFlow: (...args: unknown[]) => mockState.startAuthFlow(...args),
    client: {
      fetch: (...args: unknown[]) => mockState.clientFetch(...args),
    },
    publicStorage: {
      get: (...args: unknown[]) => mockState.publicStorageGet(...args),
      list: (...args: unknown[]) => mockState.publicStorageList(...args),
    },
    signer: () => ({
      signup: (...args: unknown[]) => mockState.signup(...args),
      signin: (...args: unknown[]) => mockState.signin(...args),
      pkdns: {
        publishHomeserverForce: (...args: unknown[]) => mockState.publishHomeserverForce(...args),
      },
    }),
  });

  const MockPubky = vi.fn().mockImplementation(createMockPubkyInstance);
  // @ts-expect-error - Adding static testnet method
  MockPubky.testnet = vi.fn().mockImplementation(createMockPubkyInstance);

  return {
    Pubky: MockPubky,
    PublicKey: {
      from: vi.fn().mockReturnValue({
        z32: () => 'homeserver-public-key-z32',
      }),
    },
    Keypair: {
      random: vi.fn(),
      fromSecretKey: vi.fn(),
    },
    AuthFlowKind: {
      signin: () => mockState.authFlowKindSignin(),
    },
    resolvePubky: vi.fn((url: string) => url.replace('pubky://', 'https://')),
  };
});

// =============================================================================
// HELPER FACTORIES
// =============================================================================

/**
 * Creates a mock Session object
 */
const createMockSession = (): Session =>
  ({
    info: {
      publicKey: {
        z32: () => 'user',
      },
    },
    storage: {
      get: (...args: unknown[]) => mockState.sessionStorageGet(...args),
      putJson: (...args: unknown[]) => mockState.sessionStoragePutJson(...args),
      putBytes: (...args: unknown[]) => mockState.sessionStoragePutBytes(...args),
      delete: (...args: unknown[]) => mockState.sessionStorageDelete(...args),
    },
    signout: (...args: unknown[]) => mockState.sessionSignout(...args),
  }) as unknown as Session;

/**
 * Creates a mock Keypair
 */
const createMockKeypair = (): Keypair =>
  ({
    publicKey: {
      z32: () => 'test-public-key-z32',
    } as PublicKey,
    secretKey: new Uint8Array(32).fill(1),
  }) as unknown as Keypair;

// =============================================================================
// TEST SUITE
// =============================================================================

describe('HomeserverService', () => {
  let HomeserverService: typeof import('@/core/services/homeserver/homeserver').HomeserverService;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();
    mockFetch.mockReset();

    // Setup default successful behaviors
    mockState.signup.mockResolvedValue(createMockSession());
    mockState.signin.mockResolvedValue(createMockSession());
    mockState.publishHomeserverForce.mockResolvedValue(undefined);
    mockState.clientFetch.mockResolvedValue(new Response('{}', { status: 200 }));
    mockState.publicStorageGet.mockResolvedValue(new Response('{}', { status: 200 }));
    mockState.publicStorageList.mockResolvedValue([]);
    mockState.getHomeserverOf.mockResolvedValue('https://test-homeserver.com');
    mockState.sessionSignout.mockResolvedValue(undefined);
    mockState.sessionStorageGet.mockResolvedValue(new Response('{}', { status: 200 }));
    mockState.sessionStoragePutJson.mockResolvedValue(undefined);
    mockState.sessionStoragePutBytes.mockResolvedValue(undefined);
    mockState.sessionStorageDelete.mockResolvedValue(undefined);
    mockState.startAuthFlow.mockReturnValue({
      authorizationUrl: 'https://auth.example.com/authorize',
      tryPollOnce: vi.fn().mockResolvedValue(createMockSession()),
      free: vi.fn(),
    });
    mockState.authFlowKindSignin.mockReturnValue('signin-kind');

    // Reset module cache and re-import
    vi.resetModules();
    const homeserverModule = await import('@/core/services/homeserver/homeserver');
    HomeserverService = homeserverModule.HomeserverService;
  });

  // ===========================================================================
  // API SURFACE
  // ===========================================================================

  describe('API Surface', () => {
    it('should expose the expected public API', () => {
      expect(HomeserverService).toBeDefined();

      const expectedMethods = [
        'signUp',
        'signIn',
        'logout',
        'generateAuthUrl',
        'request',
        'putBlob',
        'list',
        'delete',
        'get',
        'generateSignupToken',
      ] as const;

      expectedMethods.forEach((method) => {
        expect(typeof HomeserverService[method]).toBe('function');
      });
    });
  });

  // ===========================================================================
  // AUTHENTICATION
  // ===========================================================================

  describe('Authentication', () => {
    describe('signUp', () => {
      it('should return session on successful signup', async () => {
        const keypair = createMockKeypair();
        const signupToken = 'valid-signup-token';
        const expectedSession = createMockSession();

        mockState.signup.mockResolvedValue(expectedSession);

        const result = await HomeserverService.signUp({ keypair, signupToken });

        expect(result).toEqual({ session: expectedSession });
      });

      it('should call signer.signup with signup token', async () => {
        const keypair = createMockKeypair();
        const signupToken = 'test-token';

        await HomeserverService.signUp({ keypair, signupToken });

        expect(mockState.signup).toHaveBeenCalledWith(
          expect.anything(), // homeserver public key
          signupToken,
        );
      });

      it('should throw SIGNUP_FAILED error when signup fails with Error', async () => {
        const keypair = createMockKeypair();
        const signupToken = 'invalid-token';

        mockState.signup.mockRejectedValue(new Error('Invalid token'));

        await expect(HomeserverService.signUp({ keypair, signupToken })).rejects.toMatchObject({
          type: Libs.HomeserverErrorType.SIGNUP_FAILED,
          statusCode: 500,
        });
      });

      it('should throw SIGNUP_FAILED error when signup fails with non-Error', async () => {
        const keypair = createMockKeypair();
        const signupToken = 'bad-token';

        mockState.signup.mockRejectedValue('string error');

        await expect(HomeserverService.signUp({ keypair, signupToken })).rejects.toMatchObject({
          type: Libs.HomeserverErrorType.SIGNUP_FAILED,
          statusCode: 500,
        });
      });

      it('should preserve original error message in error details', async () => {
        const keypair = createMockKeypair();
        const signupToken = 'token';
        const originalMessage = 'Token expired';

        mockState.signup.mockRejectedValue(new Error(originalMessage));

        try {
          await HomeserverService.signUp({ keypair, signupToken });
          expect.fail('Should have thrown');
        } catch (error) {
          // Use name check instead of instanceof due to module reset
          expect((error as Error).name).toBe('AppError');
          expect((error as Libs.AppError).details?.originalError).toBe(originalMessage);
        }
      });
    });

    describe('signIn', () => {
      it('should return session on successful signin', async () => {
        const keypair = createMockKeypair();
        const expectedSession = createMockSession();

        mockState.getHomeserverOf.mockResolvedValue('https://homeserver.example.com');
        mockState.signin.mockResolvedValue(expectedSession);

        const result = await HomeserverService.signIn({ keypair });

        expect(mockState.signin).toHaveBeenCalled();
        expect(result).toEqual({ session: expectedSession });
      });

      it('should check homeserver before signing in', async () => {
        const keypair = createMockKeypair();

        mockState.getHomeserverOf.mockResolvedValue('https://homeserver.example.com');

        await HomeserverService.signIn({ keypair });

        expect(mockState.getHomeserverOf).toHaveBeenCalledWith(keypair.publicKey);
      });

      it('should attempt to republish homeserver and return undefined when checkHomeserver fails', async () => {
        // NOTE: This is intentional behavior - after republishing the homeserver,
        // the method returns undefined to signal the caller should retry signin.
        // The republish is a recovery mechanism when PKARR records are stale.
        const keypair = createMockKeypair();

        // checkHomeserver throws because no homeserver found
        mockState.getHomeserverOf.mockResolvedValue(null);

        const result = await HomeserverService.signIn({ keypair });

        expect(mockState.publishHomeserverForce).toHaveBeenCalled();
        expect(result).toBeUndefined();
      });

      it('should throw NOT_AUTHENTICATED error when both signin and republish fail', async () => {
        const keypair = createMockKeypair();

        mockState.getHomeserverOf.mockResolvedValue(null);
        mockState.publishHomeserverForce.mockRejectedValue(new Error('Republish failed'));

        await expect(HomeserverService.signIn({ keypair })).rejects.toMatchObject({
          type: Libs.HomeserverErrorType.NOT_AUTHENTICATED,
          statusCode: 401,
        });
      });
    });

    describe('logout', () => {
      it('should sign out using the Session object', async () => {
        const session = createMockSession();

        await HomeserverService.logout({ session });

        expect(mockState.sessionSignout).toHaveBeenCalledOnce();
      });

      it('should throw FETCH_FAILED error when signout fails', async () => {
        const session = createMockSession();
        mockState.sessionSignout.mockRejectedValue(new Error('Network error'));

        await expect(HomeserverService.logout({ session })).rejects.toMatchObject({
          type: Libs.HomeserverErrorType.FETCH_FAILED,
          statusCode: 500,
        });
      });
    });

    describe('generateAuthUrl', () => {
      it('should return authorizationUrl and awaitApproval promise', async () => {
        const result = await HomeserverService.generateAuthUrl();

        expect(result).toHaveProperty('authorizationUrl');
        expect(result).toHaveProperty('awaitApproval');
        expect(typeof result.authorizationUrl).toBe('string');
        expect(result.awaitApproval).toBeInstanceOf(Promise);
      });

      it('should call startAuthFlow with default capabilities', async () => {
        await HomeserverService.generateAuthUrl();

        expect(mockState.startAuthFlow).toHaveBeenCalledWith(
          '/pub/pubky.app/:rw', // Default capabilities
          'signin-kind', // AuthFlowKind.signin()
          expect.any(String), // HTTP relay
        );
      });

      it('should call startAuthFlow with custom capabilities when provided', async () => {
        const customCaps = '/custom/path/:r';

        await HomeserverService.generateAuthUrl(customCaps);

        expect(mockState.startAuthFlow).toHaveBeenCalledWith(customCaps, 'signin-kind', expect.any(String));
      });

      it('should throw AUTH_REQUEST_FAILED error when flow fails', async () => {
        mockState.startAuthFlow.mockImplementation(() => {
          throw new Error('Flow initialization failed');
        });

        await expect(HomeserverService.generateAuthUrl()).rejects.toMatchObject({
          type: Libs.HomeserverErrorType.AUTH_REQUEST_FAILED,
          statusCode: 500,
        });
      });
    });
  });

  // ===========================================================================
  // DATA OPERATIONS
  // ===========================================================================

  describe('Data Operations', () => {
    describe('request', () => {
      describe('GET requests', () => {
        it('should return parsed JSON for successful GET', async () => {
          HomeserverService.setSession(createMockSession());
          const testData = { name: 'test', value: 123 };
          mockState.sessionStorageGet.mockResolvedValue(new Response(JSON.stringify(testData), { status: 200 }));

          const result = await HomeserverService.request<typeof testData>(
            Core.HomeserverAction.GET,
            'pubky://user/pub/data.json',
          );

          expect(result).toEqual(testData);
          expect(mockState.sessionStorageGet).toHaveBeenCalledWith('/pub/data.json');
        });

        it('should return undefined for empty GET response', async () => {
          HomeserverService.setSession(createMockSession());
          mockState.sessionStorageGet.mockResolvedValue(new Response('', { status: 200 }));

          const result = await HomeserverService.request(Core.HomeserverAction.GET, 'pubky://user/pub/empty.json');

          expect(result).toBeUndefined();
        });

        it('should return undefined for invalid JSON response', async () => {
          HomeserverService.setSession(createMockSession());
          mockState.sessionStorageGet.mockResolvedValue(new Response('not-valid-json', { status: 200 }));

          const result = await HomeserverService.request(Core.HomeserverAction.GET, 'pubky://user/pub/invalid.json');

          expect(result).toBeUndefined();
        });
      });

      describe('PUT requests', () => {
        it('should send JSON body for PUT request', async () => {
          HomeserverService.setSession(createMockSession());
          const bodyData = { name: 'new-value' };
          await HomeserverService.request(Core.HomeserverAction.PUT, 'pubky://user/pub/data.json', bodyData);

          expect(mockState.sessionStoragePutJson).toHaveBeenCalledWith('/pub/data.json', bodyData);
        });

        it('should return undefined for successful PUT', async () => {
          HomeserverService.setSession(createMockSession());

          const result = await HomeserverService.request(Core.HomeserverAction.PUT, 'pubky://user/pub/data.json', {
            data: 'test',
          });

          expect(result).toBeUndefined();
        });
      });

      describe('DELETE requests', () => {
        it('should send DELETE request without body', async () => {
          HomeserverService.setSession(createMockSession());

          await HomeserverService.request(Core.HomeserverAction.DELETE, 'pubky://user/pub/data.json');

          expect(mockState.sessionStorageDelete).toHaveBeenCalledWith('/pub/data.json');
        });
      });

      describe('Error handling', () => {
        it('should throw FETCH_FAILED error for non-OK response', async () => {
          HomeserverService.setSession(createMockSession());
          mockState.sessionStorageGet.mockResolvedValue(
            new Response('Not Found', { status: 404, statusText: 'Not Found' }),
          );

          await expect(
            HomeserverService.request(Core.HomeserverAction.GET, 'pubky://user/pub/missing.json'),
          ).rejects.toMatchObject({
            type: Libs.HomeserverErrorType.FETCH_FAILED,
            statusCode: 404,
          });
        });

        it('should throw SESSION_EXPIRED error for 401 response', async () => {
          HomeserverService.setSession(createMockSession());
          mockState.sessionStorageGet.mockResolvedValue(
            new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' }),
          );

          await expect(
            HomeserverService.request(Core.HomeserverAction.GET, 'pubky://user/pub/data.json'),
          ).rejects.toMatchObject({
            type: Libs.HomeserverErrorType.SESSION_EXPIRED,
            statusCode: 401,
          });
        });

        it('should throw FETCH_FAILED error for network errors', async () => {
          HomeserverService.setSession(createMockSession());
          mockState.sessionStorageGet.mockRejectedValue(new Error('Network error'));

          await expect(
            HomeserverService.request(Core.HomeserverAction.GET, 'pubky://user/pub/data.json'),
          ).rejects.toMatchObject({
            type: Libs.HomeserverErrorType.FETCH_FAILED,
            statusCode: 500,
          });
        });
      });
    });

    describe('putBlob', () => {
      it('should upload binary data successfully', async () => {
        HomeserverService.setSession(createMockSession());
        const blobData = new Uint8Array([1, 2, 3, 4, 5]);

        await HomeserverService.putBlob('pubky://user/pub/avatar.png', blobData);

        expect(mockState.sessionStoragePutBytes).toHaveBeenCalledWith('/pub/avatar.png', blobData);
      });

      it('should throw PUT_FAILED error for non-OK response', async () => {
        HomeserverService.setSession(createMockSession());
        const blobData = new Uint8Array([1, 2, 3]);
        mockState.sessionStoragePutBytes.mockRejectedValue({
          name: 'RequestError',
          message: 'Payload Too Large',
          data: { statusCode: 413 },
        });

        await expect(HomeserverService.putBlob('pubky://user/pub/large.bin', blobData)).rejects.toMatchObject({
          type: Libs.HomeserverErrorType.PUT_FAILED,
          statusCode: 413,
        });
      });

      it('should throw SESSION_EXPIRED error for 401 response', async () => {
        HomeserverService.setSession(createMockSession());
        const blobData = new Uint8Array([1, 2, 3]);
        mockState.sessionStoragePutBytes.mockRejectedValue({
          name: 'AuthenticationError',
          message: 'Session expired',
          data: { statusCode: 401 },
        });

        await expect(HomeserverService.putBlob('pubky://user/pub/avatar.png', blobData)).rejects.toMatchObject({
          type: Libs.HomeserverErrorType.SESSION_EXPIRED,
          statusCode: 401,
        });
      });
    });

    describe('list', () => {
      it('should return array of file URLs', async () => {
        const mockFiles = ['file1.json', 'file2.json', 'file3.json'];
        mockState.publicStorageList.mockResolvedValue(mockFiles);

        const result = await HomeserverService.list('pubky://user/pub/posts/');

        expect(result).toEqual(mockFiles);
      });

      it('should call list with default parameters', async () => {
        mockState.publicStorageList.mockResolvedValue([]);

        await HomeserverService.list('pubky://user/pub/posts/');

        expect(mockState.publicStorageList).toHaveBeenCalledWith(
          'pubky://user/pub/posts/',
          null, // cursor
          false, // reverse
          500, // limit
          false, // shallow
        );
      });

      it('should pass pagination parameters to list', async () => {
        mockState.publicStorageList.mockResolvedValue([]);

        await HomeserverService.list('pubky://user/pub/posts/', 'cursor123', true, 100);

        expect(mockState.publicStorageList).toHaveBeenCalledWith(
          'pubky://user/pub/posts/',
          'cursor123',
          true,
          100,
          false,
        );
      });

      it('should throw FETCH_FAILED error on list failure', async () => {
        mockState.publicStorageList.mockRejectedValue(new Error('List failed'));

        await expect(HomeserverService.list('pubky://user/pub/posts/')).rejects.toMatchObject({
          type: Libs.HomeserverErrorType.FETCH_FAILED,
          statusCode: 500,
        });
      });
    });

    describe('delete', () => {
      it('should call request with DELETE method', async () => {
        HomeserverService.setSession(createMockSession());

        await HomeserverService.delete('pubky://user/pub/file.json');

        expect(mockState.sessionStorageDelete).toHaveBeenCalledWith('/pub/file.json');
      });

      it('should throw FETCH_FAILED error on delete failure', async () => {
        HomeserverService.setSession(createMockSession());
        mockState.sessionStorageDelete.mockRejectedValue({
          name: 'RequestError',
          message: 'Forbidden',
          data: { statusCode: 403 },
        });

        await expect(HomeserverService.delete('pubky://user/pub/protected.json')).rejects.toMatchObject({
          type: Libs.HomeserverErrorType.FETCH_FAILED,
          statusCode: 403,
        });
      });
    });

    describe('get', () => {
      it('should use publicStorage.get for fetching', async () => {
        const testUrl = 'pubky://user/pub/public.json';
        const mockResponse = new Response(JSON.stringify({ data: 'public' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
        mockState.publicStorageGet.mockResolvedValue(mockResponse);

        const result = await HomeserverService.get(testUrl);

        expect(mockState.publicStorageGet).toHaveBeenCalledWith(testUrl);
        expect(result).toBeInstanceOf(Response);
        const jsonData = await result.json();
        expect(jsonData).toEqual({ data: 'public' });
      });

      it('should wrap errors from publicStorage.get as AppError', async () => {
        const testUrl = 'pubky://user/pub/data.json';
        const networkError = new Error('Network request failed');
        mockState.publicStorageGet.mockRejectedValue(networkError);

        await expect(HomeserverService.get(testUrl)).rejects.toMatchObject({
          type: Libs.HomeserverErrorType.FETCH_FAILED,
          statusCode: 500,
        });
      });
    });
  });

  // ===========================================================================
  // EDGE CASES & ERROR HANDLING
  // ===========================================================================

  describe('Edge Cases & Error Handling', () => {
    describe('handleError (private)', () => {
      it('should re-throw AppError instances without wrapping', async () => {
        // Import Libs after module reset to get matching AppError class
        const freshLibs = await import('@/libs');
        const appError = freshLibs.createHomeserverError(
          freshLibs.HomeserverErrorType.NOT_AUTHENTICATED,
          'Already an AppError',
          401,
        );
        mockState.signup.mockRejectedValue(appError);

        try {
          await HomeserverService.signUp({
            keypair: createMockKeypair(),
            signupToken: 'token',
          });
          expect.fail('Should have thrown');
        } catch (error) {
          // Should be the exact same error instance (not wrapped)
          expect(error).toBe(appError);
          expect((error as Libs.AppError).type).toBe(freshLibs.HomeserverErrorType.NOT_AUTHENTICATED);
          expect((error as Libs.AppError).message).toBe('Already an AppError');
        }
      });
    });

    describe('Session expiration handling', () => {
      it('should include URL in SESSION_EXPIRED error details', async () => {
        const testUrl = 'pubky://user/pub/data.json';
        HomeserverService.setSession(createMockSession());
        mockState.sessionStorageGet.mockResolvedValue(new Response('Session expired', { status: 401 }));

        try {
          await HomeserverService.request(Core.HomeserverAction.GET, testUrl);
          expect.fail('Should have thrown');
        } catch (error) {
          // Use name check instead of instanceof due to module reset
          expect((error as Error).name).toBe('AppError');
          expect((error as Libs.AppError).details?.url).toContain('user/pub/data.json');
        }
      });

      it('should use custom error message from 401 response body', async () => {
        const customMessage = 'Your session has expired, please login again';
        HomeserverService.setSession(createMockSession());
        mockState.sessionStorageGet.mockResolvedValue(new Response(customMessage, { status: 401 }));

        try {
          await HomeserverService.request(Core.HomeserverAction.GET, 'pubky://user/pub/data.json');
          expect.fail('Should have thrown');
        } catch (error) {
          // Use name check instead of instanceof due to module reset
          expect((error as Error).name).toBe('AppError');
          expect((error as Libs.AppError).message).toBe(customMessage);
        }
      });
    });

    describe('generateSignupToken (admin utility)', () => {
      it('should fetch token from admin endpoint with auth header', async () => {
        const expectedToken = 'generated-signup-token-123';
        mockFetch.mockResolvedValue(new Response(expectedToken, { status: 200 }));

        const result = await HomeserverService.generateSignupToken();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String), // Admin URL from env
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              'X-Admin-Password': expect.any(String),
            }),
          }),
        );
        expect(result).toBe(expectedToken);
      });

      it('should throw NETWORK_ERROR for non-OK response', async () => {
        mockFetch.mockResolvedValue(new Response('Forbidden', { status: 403 }));

        await expect(HomeserverService.generateSignupToken()).rejects.toMatchObject({
          type: Libs.CommonErrorType.NETWORK_ERROR,
        });
      });

      it('should throw UNEXPECTED_ERROR when no token received', async () => {
        mockFetch.mockResolvedValue(new Response('', { status: 200 }));

        await expect(HomeserverService.generateSignupToken()).rejects.toMatchObject({
          type: Libs.CommonErrorType.UNEXPECTED_ERROR,
        });
      });

      it('should trim whitespace from received token', async () => {
        mockFetch.mockResolvedValue(new Response('  token-with-spaces  \n', { status: 200 }));

        const result = await HomeserverService.generateSignupToken();

        expect(result).toBe('token-with-spaces');
      });
    });

    describe('URL resolution', () => {
      it('should use session storage paths for pubky URLs', async () => {
        HomeserverService.setSession(createMockSession());
        mockState.sessionStorageGet.mockResolvedValue(new Response('{}', { status: 200 }));

        await HomeserverService.request(Core.HomeserverAction.GET, 'pubky://user/pub/data.json');

        expect(mockState.sessionStorageGet).toHaveBeenCalledWith('/pub/data.json');
      });
    });
  });
});
