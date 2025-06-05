import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock global fetch
global.fetch = vi.fn();

// Mock @synonymdev/pubky
vi.doMock('@synonymdev/pubky', () => {
  const createMockClient = () => ({
    signup: vi.fn(),
    fetch: vi.fn(),
    signout: vi.fn(),
  });

  const createMockKeypair = () => ({
    publicKey: vi.fn(() => ({ z32: () => 'test-public-key-z32' })),
    secretKey: vi.fn(() => new Uint8Array([1, 2, 3, 4])),
  });

  const createMockPublicKey = () => ({
    z32: vi.fn(() => 'test-public-key-z32'),
  });

  const MockClient = vi.fn().mockImplementation(createMockClient) as unknown as typeof Client;
  // @ts-expect-error - Mocking the testnet method
  MockClient.testnet = vi.fn(createMockClient) as unknown as typeof Client;

  return {
    Client: MockClient,
    Keypair: {
      random: vi.fn(createMockKeypair),
      fromSecretKey: vi.fn(createMockKeypair),
    },
    PublicKey: {
      from: vi.fn(createMockPublicKey),
    },
  };
});

// Import modules after mocking - use dynamic imports to ensure mocks are applied
let HomeserverService: typeof import('@/core/services/homeserver/homeserver').HomeserverService;
let Keypair: typeof import('@synonymdev/pubky').Keypair;
let PublicKey: typeof import('@synonymdev/pubky').PublicKey;
import { HomeserverErrorType } from '@/libs';
import { User } from '@/core';
import { Client } from '@synonymdev/pubky';

// Define types for mock functions
type MockClient = {
  signup: ReturnType<typeof vi.fn>;
  fetch: ReturnType<typeof vi.fn>;
  signout: ReturnType<typeof vi.fn>;
};

describe('HomeserverService', () => {
  let mockUser: User;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Use dynamic imports to ensure mocked modules are loaded
    const homeserverModule = await import('@/core/services/homeserver/homeserver');
    HomeserverService = homeserverModule.HomeserverService;
    const pubkyModule = await import('@synonymdev/pubky');
    Keypair = pubkyModule.Keypair;
    PublicKey = pubkyModule.PublicKey;

    // Reset singleton instance
    (HomeserverService as unknown as { instance: undefined }).instance = undefined;

    // Create mock user
    mockUser = {
      details: {
        id: 'test-user-id',
        name: 'Test User',
        bio: 'Test bio',
        image: null,
        links: null,
        status: null,
        indexed_at: Date.now(),
      },
      counts: {
        tagged: 0,
        tags: 0,
        unique_tags: 0,
        posts: 0,
        replies: 0,
        following: 0,
        followers: 0,
        friends: 0,
        bookmarks: 0,
      },
      tags: [],
      relationship: {
        following: false,
        followed_by: false,
        muted: false,
      },
      following: [],
      followers: [],
      muted: [],
      indexed_at: null,
      updated_at: Date.now(),
      sync_status: 'local',
      sync_ttl: Date.now() + 300000,
      save: vi.fn().mockResolvedValue(undefined),
    } as unknown as User;
  });

  afterEach(() => {
    vi.resetAllMocks();
    (HomeserverService as unknown as { instance: undefined }).instance = undefined;
  });

  describe('Singleton Pattern', () => {
    it('should create only one instance', () => {
      const instance1 = HomeserverService.getInstance();
      const instance2 = HomeserverService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should return the same client for all instances', () => {
      const service1 = HomeserverService.getInstance();
      const service2 = HomeserverService.getInstance();

      expect(service1.getClient()).toBe(service2.getClient());
    });
  });

  describe('Key Generation', () => {
    it('should generate random keypair', () => {
      const service = HomeserverService.getInstance();
      const result = service.generateRandomKeypair();

      expect(Keypair.random).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should generate random keys as strings', () => {
      const service = HomeserverService.getInstance();
      const result = service.generateRandomKeys();

      expect(result).toEqual({
        publicKey: 'test-public-key-z32',
        secretKey: '1,2,3,4',
      });
      expect(typeof result.publicKey).toBe('string');
      expect(typeof result.secretKey).toBe('string');
    });

    it('should create keypair from secret key', () => {
      const service = HomeserverService.getInstance();
      const secretKey = new Uint8Array(32).fill(1); // valid 32-byte array

      const result = service.keypairFromSecretKey(secretKey);

      expect(Keypair.fromSecretKey).toHaveBeenCalledWith(secretKey);
      expect(result).toBeDefined();
    });
  });

  describe('Authentication', () => {
    it('should signup successfully', async () => {
      const service = HomeserverService.getInstance();
      const keypair = service.generateRandomKeypair();
      const homeserverKey = 'valid-homeserver-key';

      // Mock successful signup
      const mockClient = service.getClient() as unknown as MockClient;
      (mockClient.signup as ReturnType<typeof vi.fn>).mockResolvedValue({
        pubky: () => ({ z32: () => 'test-key' }),
        capabilities: () => ['read', 'write'],
      });
      (mockClient.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response('OK', { status: 200 }));

      const result = await service.signup(mockUser, keypair, homeserverKey);

      expect(mockClient.signup).toHaveBeenCalled();
      // Profile creation is skipped in tests, so no fetch call for profile
      expect(result.session).toHaveProperty('pubky');
      expect(result.session).toHaveProperty('capabilities');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should signup with token', async () => {
      const service = HomeserverService.getInstance();
      const keypair = service.generateRandomKeypair();
      const token = 'signup-token';

      // Mock successful signup
      const mockClient = service.getClient() as unknown as MockClient;
      (mockClient.signup as ReturnType<typeof vi.fn>).mockResolvedValue({
        pubky: () => ({ z32: () => 'test-key' }),
        capabilities: () => ['read', 'write'],
      });
      (mockClient.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response('OK', { status: 200 }));

      await service.signup(mockUser, keypair, token);

      expect(mockClient.signup).toHaveBeenCalled();
      // Profile creation is skipped in tests, so no fetch call for profile
    });

    it('should handle signup errors', async () => {
      const service = HomeserverService.getInstance();
      const keypair = service.generateRandomKeypair();
      const error = new Error('Server error');

      const mockClient = service.getClient() as unknown as MockClient;
      (mockClient.signup as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(service.signup(mockUser, keypair, 'invalid-key')).rejects.toMatchObject({
        type: HomeserverErrorType.SIGNUP_FAILED,
        statusCode: 500,
      });
      expect(consoleSpy).toHaveBeenCalledWith('Error during signup:', error);

      consoleSpy.mockRestore();
    });

    it('should logout successfully', async () => {
      const service = HomeserverService.getInstance();
      const keypair = service.generateRandomKeypair();
      const homeserverKey = 'valid-homeserver-key';

      // First signup to get authenticated
      const mockClient = service.getClient() as unknown as MockClient;
      (mockClient.signup as ReturnType<typeof vi.fn>).mockResolvedValue({
        pubky: () => ({ z32: () => 'test-key' }),
        capabilities: () => ['read', 'write'],
      });
      (mockClient.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response('OK', { status: 200 }));
      (mockClient.signout as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.signup(mockUser, keypair, homeserverKey);
      await service.logout('test-key');

      expect(mockClient.signout).toHaveBeenCalled();
      expect(PublicKey.from).toHaveBeenCalledWith('test-key');
    });

    it('should handle logout errors', async () => {
      const service = HomeserverService.getInstance();
      const keypair = service.generateRandomKeypair();
      const homeserverKey = 'valid-homeserver-key';
      const error = new Error('Server error');

      // First signup to get authenticated
      const mockClient = service.getClient() as unknown as MockClient;
      (mockClient.signup as ReturnType<typeof vi.fn>).mockResolvedValue({
        pubky: () => ({ z32: () => 'test-key' }),
        capabilities: () => ['read', 'write'],
      });
      (mockClient.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response('OK', { status: 200 }));
      (mockClient.signout as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      await service.signup(mockUser, keypair, homeserverKey);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(service.logout('test-key')).rejects.toMatchObject({
        type: HomeserverErrorType.LOGOUT_FAILED,
        statusCode: 500,
      });
      expect(consoleSpy).toHaveBeenCalledWith('Error during logout:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('Data Operations', () => {
    beforeEach(async () => {
      const service = HomeserverService.getInstance();
      const keypair = service.generateRandomKeypair();
      const homeserverKey = 'valid-homeserver-key';

      const mockClient = service.getClient() as unknown as MockClient;
      (mockClient.signup as ReturnType<typeof vi.fn>).mockResolvedValue({
        pubky: () => ({ z32: () => 'test-key' }),
        capabilities: () => ['read', 'write'],
      });
      (mockClient.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response('OK', { status: 200 }));

      await service.signup(mockUser, keypair, homeserverKey);
    });

    it('should fetch data (GET)', async () => {
      const service = HomeserverService.getInstance();
      const url = 'pubky://test-key/data';

      const mockClient = service.getClient() as unknown as MockClient;
      const mockResponse = new Response('{"data": "test"}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      (mockClient.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const response = await service.fetch(url);

      expect(mockClient.fetch).toHaveBeenCalledWith(url, undefined);
      expect(response).toBeInstanceOf(Response);
    });

    it('should create/update data (PUT)', async () => {
      const service = HomeserverService.getInstance();
      const url = 'pubky://test-key/data';
      const options = {
        method: 'PUT' as const,
        body: JSON.stringify({ message: 'Hello World' }),
        credentials: 'include' as const,
      };

      const mockClient = service.getClient() as unknown as MockClient;
      const mockResponse = new Response('OK', { status: 200 });
      (mockClient.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      await service.fetch(url, options);

      expect(mockClient.fetch).toHaveBeenCalledWith(url, options);
    });

    it('should delete data (DELETE)', async () => {
      const service = HomeserverService.getInstance();
      const url = 'pubky://test-key/data';
      const options = {
        method: 'DELETE' as const,
        credentials: 'include' as const,
      };

      const mockClient = service.getClient() as unknown as MockClient;
      const mockResponse = new Response('', { status: 200 });
      (mockClient.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      await service.fetch(url, options);

      expect(mockClient.fetch).toHaveBeenCalledWith(url, options);
    });

    it('should handle fetch errors', async () => {
      const service = HomeserverService.getInstance();
      const error = new Error('Network error');

      const mockClient = service.getClient() as unknown as MockClient;
      (mockClient.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(service.fetch('invalid-url')).rejects.toMatchObject({
        type: HomeserverErrorType.FETCH_FAILED,
        statusCode: 500,
      });
      expect(consoleSpy).toHaveBeenCalledWith('Error during fetch:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(async () => {
      const service = HomeserverService.getInstance();
      const keypair = service.generateRandomKeypair();
      const homeserverKey = 'valid-homeserver-key';

      const mockClient = service.getClient() as unknown as MockClient;
      (mockClient.signup as ReturnType<typeof vi.fn>).mockResolvedValue({
        pubky: () => ({ z32: () => 'test-key' }),
        capabilities: () => ['read', 'write'],
      });
      (mockClient.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response('OK', { status: 200 }));

      await service.signup(mockUser, keypair, homeserverKey);
    });

    it('should handle empty response data', async () => {
      const service = HomeserverService.getInstance();
      const mockClient = service.getClient() as unknown as MockClient;

      (mockClient.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response('', { status: 200 }));

      const response = await service.fetch('pubky://test-key/empty');
      expect(response.status).toBe(200);
    });

    it('should handle different HTTP status codes', async () => {
      const service = HomeserverService.getInstance();
      const mockClient = service.getClient() as unknown as MockClient;

      (mockClient.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response('Not Found', { status: 404 }));

      const response = await service.fetch('pubky://test-key/notfound');
      expect(response.status).toBe(404);
    });

    it('should preserve credentials option', async () => {
      const service = HomeserverService.getInstance();
      const mockClient = service.getClient() as unknown as MockClient;

      (mockClient.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response('OK', { status: 200 }));

      await service.fetch('pubky://test-key/data', { credentials: 'omit' });

      expect(mockClient.fetch).toHaveBeenCalledWith('pubky://test-key/data', {
        credentials: 'omit',
      });
    });
  });

  describe('Type Safety', () => {
    it('should maintain correct return types for all methods', () => {
      const service = HomeserverService.getInstance();

      // Test return types without calling async methods
      expect(service.getClient()).toBeDefined();
      expect(service.generateRandomKeypair()).toBeDefined();

      const keys = service.generateRandomKeys();
      expect(keys).toHaveProperty('publicKey');
      expect(keys).toHaveProperty('secretKey');
      expect(typeof keys.publicKey).toBe('string');
      expect(typeof keys.secretKey).toBe('string');
    });
  });

  describe('Session and Keypair State Management', () => {
    it('should track current keypair after generation', () => {
      const service = HomeserverService.getInstance();
      const keypair = service.generateRandomKeypair();

      expect(service.getCurrentKeypair()).toBe(keypair);
      expect(service.getCurrentPublicKey()).toBe('test-public-key-z32');
    });

    it('should track current keypair after creation from secret key', () => {
      const service = HomeserverService.getInstance();
      const secretKey = new Uint8Array(32).fill(2); // valid 32-byte array
      const keypair = service.keypairFromSecretKey(secretKey);

      expect(service.getCurrentKeypair()).toBe(keypair);
      expect(service.getCurrentPublicKey()).toBe('test-public-key-z32');
    });

    it('should track session after successful signup', async () => {
      const service = HomeserverService.getInstance();
      const keypair = service.generateRandomKeypair();
      const homeserverKey = 'valid-homeserver-key';

      const mockClient = service.getClient() as unknown as MockClient;
      const mockSession = {
        pubky: () => ({ z32: () => 'test-key' }),
        capabilities: () => ['read', 'write'],
      };
      (mockClient.signup as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);
      (mockClient.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response('OK', { status: 200 }));

      await service.signup(mockUser, keypair, homeserverKey);

      expect(service.getCurrentSession()).toBe(mockSession);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should clear session and keypair after logout', async () => {
      const service = HomeserverService.getInstance();
      const keypair = service.generateRandomKeypair();
      const homeserverKey = 'valid-homeserver-key';

      const mockClient = service.getClient() as unknown as MockClient;
      (mockClient.signup as ReturnType<typeof vi.fn>).mockResolvedValue({
        pubky: () => ({ z32: () => 'test-key' }),
        capabilities: () => ['read', 'write'],
      });
      (mockClient.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response('OK', { status: 200 }));
      (mockClient.signout as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.signup(mockUser, keypair, homeserverKey);
      expect(service.isAuthenticated()).toBe(true);

      await service.logout('test-key');
      expect(service.getCurrentSession()).toBeNull();
      expect(service.getCurrentKeypair()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return null for public key when no keypair is set', () => {
      const service = HomeserverService.getInstance();
      expect(service.getCurrentPublicKey()).toBeNull();
    });

    it('should maintain keypair state across multiple operations', () => {
      const service = HomeserverService.getInstance();
      const keypair = service.generateRandomKeypair();

      // Generate new keys should update the current keypair
      service.generateRandomKeys();
      expect(service.getCurrentKeypair()).not.toBe(keypair);
      expect(service.getCurrentPublicKey()).toBe('test-public-key-z32');
    });
  });

  describe('Error Handling', () => {
    it('should throw INVALID_HOMESERVER_KEY error for invalid homeserver key', async () => {
      const service = HomeserverService.getInstance();
      const keypair = service.generateRandomKeypair();
      const invalidKey = 'invalid-key';

      const mockClient = service.getClient() as unknown as MockClient;
      (mockClient.signup as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('invalid public key'));

      await expect(service.signup(mockUser, keypair, invalidKey)).rejects.toMatchObject({
        type: HomeserverErrorType.INVALID_HOMESERVER_KEY,
        statusCode: 400,
      });
    });

    it('should throw NOT_AUTHENTICATED error when fetching without session', async () => {
      const service = HomeserverService.getInstance();
      await expect(service.fetch('pubky://test-key/data')).rejects.toMatchObject({
        type: HomeserverErrorType.NOT_AUTHENTICATED,
        statusCode: 401,
      });
    });

    it('should throw NOT_AUTHENTICATED error when logging out without session', async () => {
      const service = HomeserverService.getInstance();
      await expect(service.logout('test-key')).rejects.toMatchObject({
        type: HomeserverErrorType.NOT_AUTHENTICATED,
        statusCode: 401,
      });
    });

    it('should throw INVALID_PUBLIC_KEY error for invalid public key during logout', async () => {
      const service = HomeserverService.getInstance();
      const keypair = service.generateRandomKeypair();
      const homeserverKey = 'valid-homeserver-key';

      const mockClient = service.getClient() as unknown as MockClient;
      (mockClient.signup as ReturnType<typeof vi.fn>).mockResolvedValue({
        pubky: () => ({ z32: () => 'test-key' }),
        capabilities: () => ['read', 'write'],
      });
      (mockClient.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response('OK', { status: 200 }));
      (mockClient.signout as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('invalid public key'));

      await service.signup(mockUser, keypair, homeserverKey);
      await expect(service.logout('invalid-key')).rejects.toMatchObject({
        type: HomeserverErrorType.INVALID_PUBLIC_KEY,
        statusCode: 400,
      });
    });

    it('should throw INVALID_SECRET_KEY error for invalid secret key format', () => {
      const service = HomeserverService.getInstance();
      const invalidSecretKey = new Uint8Array([1, 2, 3]); // Invalid length

      expect(() => service.keypairFromSecretKey(invalidSecretKey)).toThrow(
        expect.objectContaining({
          type: HomeserverErrorType.INVALID_SECRET_KEY,
          statusCode: 400,
        }),
      );
    });

    it('should throw FETCH_FAILED error when fetch operation fails', async () => {
      const service = HomeserverService.getInstance();
      const keypair = service.generateRandomKeypair();
      const homeserverKey = 'valid-homeserver-key';

      const mockClient = service.getClient() as unknown as MockClient;
      (mockClient.signup as ReturnType<typeof vi.fn>).mockResolvedValue({
        pubky: () => ({ z32: () => 'test-key' }),
        capabilities: () => ['read', 'write'],
      });
      // Since profile creation is skipped in tests, we only need to mock the expected fetch call to fail
      (mockClient.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      await service.signup(mockUser, keypair, homeserverKey);
      await expect(service.fetch('pubky://test-key/data')).rejects.toMatchObject({
        type: HomeserverErrorType.FETCH_FAILED,
        statusCode: 500,
      });
    });

    it('should throw LOGOUT_FAILED error when logout operation fails', async () => {
      const service = HomeserverService.getInstance();
      const keypair = service.generateRandomKeypair();
      const homeserverKey = 'valid-homeserver-key';

      const mockClient = service.getClient() as unknown as MockClient;
      (mockClient.signup as ReturnType<typeof vi.fn>).mockResolvedValue({
        pubky: () => ({ z32: () => 'test-key' }),
        capabilities: () => ['read', 'write'],
      });
      (mockClient.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response('OK', { status: 200 }));
      (mockClient.signout as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Server error'));

      await service.signup(mockUser, keypair, homeserverKey);
      await expect(service.logout('test-key')).rejects.toMatchObject({
        type: HomeserverErrorType.LOGOUT_FAILED,
        statusCode: 500,
      });
    });

    it('should throw SIGNUP_FAILED error when signup operation fails', async () => {
      const service = HomeserverService.getInstance();
      const keypair = service.generateRandomKeypair();
      const homeserverKey = 'valid-homeserver-key';

      const mockClient = service.getClient() as unknown as MockClient;
      (mockClient.signup as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Server error'));

      await expect(service.signup(mockUser, keypair, homeserverKey)).rejects.toMatchObject({
        type: HomeserverErrorType.SIGNUP_FAILED,
        statusCode: 500,
      });
    });
  });
});
