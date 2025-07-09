import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Session } from '@synonymdev/pubky';

// Mock global fetch
global.fetch = vi.fn();

// Mock pubky-app-specs to avoid WebAssembly issues
vi.mock('pubky-app-specs', () => ({
  default: vi.fn(() => Promise.resolve()),
}));

// Mock useKeypairStore
const mockKeypairStore = {
  publicKey: '',
  secretKey: new Uint8Array(32).fill(1),
  session: null as Session | null,
  isAuthenticated: false,
  setSession: vi.fn(),
  clearSession: vi.fn(),
  generateKeys: vi.fn(),
  clearKeys: vi.fn(),
  setAuthenticated: vi.fn(),
};

// Mock useUserStore (now useProfileStore)
const mockUserStore = {
  publicKey: '',
  session: null as Session | null,
  isAuthenticated: false,
  setSession: vi.fn(),
  clearSession: vi.fn(),
  setAuthenticated: vi.fn(),
  clearCurrentUser: vi.fn(),
  clearAllErrors: vi.fn(),
  clearAllLoading: vi.fn(),
};

// Mock useOnboardingStore (this is what HomeserverService actually uses)
const mockOnboardingStore = {
  secretKey: new Uint8Array(32).fill(1),
  generateKeys: vi.fn(),
  clearKeys: vi.fn(),
};

vi.mock('@/core/stores', () => ({
  useKeypairStore: {
    getState: vi.fn(() => mockKeypairStore),
  },
  useUserStore: {
    getState: vi.fn(() => mockUserStore),
  },
  useOnboardingStore: {
    getState: vi.fn(() => mockOnboardingStore),
  },
  useProfileStore: {
    getState: vi.fn(() => mockUserStore),
  },
}));

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
let HomeserverErrorType: typeof import('@/libs').HomeserverErrorType;
import { Client } from '@synonymdev/pubky';

// Define types for mock functions
type MockClient = {
  signup: ReturnType<typeof vi.fn>;
  fetch: ReturnType<typeof vi.fn>;
  signout: ReturnType<typeof vi.fn>;
};

// Create a mock session object
const createMockSession = (): Session =>
  ({
    pubky: () => ({ z32: () => 'test-key' }),
    capabilities: () => ['read', 'write'],
  }) as Session;

describe('HomeserverService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Reset mock stores
    mockKeypairStore.publicKey = '';
    mockKeypairStore.secretKey = new Uint8Array(32).fill(1);
    mockKeypairStore.session = null;
    mockKeypairStore.isAuthenticated = false;

    mockOnboardingStore.secretKey = new Uint8Array(32).fill(1);

    mockUserStore.publicKey = '';
    mockUserStore.session = null;
    mockUserStore.isAuthenticated = false;

    // Use dynamic imports to ensure mocked modules are loaded
    const homeserverModule = await import('@/core/services/homeserver/homeserver');
    HomeserverService = homeserverModule.HomeserverService;
    const pubkyModule = await import('@synonymdev/pubky');
    Keypair = pubkyModule.Keypair;
    PublicKey = pubkyModule.PublicKey;
    const libsModule = await import('@/libs');
    HomeserverErrorType = libsModule.HomeserverErrorType;

    // Reset singleton instance
    (HomeserverService as unknown as { instance: undefined }).instance = undefined;
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
  });

  describe('Authentication', () => {
    it('should signup successfully', async () => {
      const service = HomeserverService.getInstance();
      const keypair = Keypair.fromSecretKey(new Uint8Array(32).fill(1));
      const signupToken = 'test-token';

      // Mock the client methods
      const mockClient = service['client'] as unknown as MockClient;
      const mockSession = createMockSession();
      mockClient.signup.mockResolvedValue(mockSession);

      const result = await service.signup(keypair, signupToken);

      expect(mockClient.signup).toHaveBeenCalled();
      expect(result.session).toBe(mockSession);
    });

    it('should signup with token', async () => {
      const service = HomeserverService.getInstance();
      const keypair = Keypair.fromSecretKey(new Uint8Array(32).fill(1));
      const token = 'signup-token';

      // Mock the client methods
      const mockClient = service['client'] as unknown as MockClient;
      const mockSession = createMockSession();
      mockClient.signup.mockResolvedValue(mockSession);

      await service.signup(keypair, token);

      expect(mockClient.signup).toHaveBeenCalled();
    });

    it('should handle signup errors', async () => {
      const service = HomeserverService.getInstance();
      const keypair = Keypair.fromSecretKey(new Uint8Array(32).fill(1));
      const error = new Error('Server error');

      const mockClient = service['client'] as unknown as MockClient;
      mockClient.signup.mockRejectedValue(error);

      await expect(service.signup(keypair, 'invalid-key')).rejects.toMatchObject({
        type: HomeserverErrorType.SIGNUP_FAILED,
        statusCode: 500,
      });
    });

    it('should logout successfully', async () => {
      const service = HomeserverService.getInstance();

      // Set up authenticated state
      mockUserStore.session = createMockSession();
      mockUserStore.isAuthenticated = true;
      service['currentKeypair'] = Keypair.fromSecretKey(new Uint8Array(32).fill(1));

      const mockClient = service['client'] as unknown as MockClient;
      mockClient.signout.mockResolvedValue(undefined);

      await service.logout();

      expect(mockClient.signout).toHaveBeenCalled();
      expect(PublicKey.from).toHaveBeenCalledWith('test-public-key-z32');
    });

    it('should handle logout errors', async () => {
      const service = HomeserverService.getInstance();

      // Set up authenticated state
      mockUserStore.session = createMockSession();
      mockUserStore.isAuthenticated = true;
      service['currentKeypair'] = Keypair.fromSecretKey(new Uint8Array(32).fill(1));

      const error = new Error('Server error');
      const mockClient = service['client'] as unknown as MockClient;
      mockClient.signout.mockRejectedValue(error);

      await expect(service.logout()).rejects.toMatchObject({
        type: HomeserverErrorType.LOGOUT_FAILED,
        statusCode: 500,
      });
    });
  });

  describe('Data Operations', () => {
    beforeEach(async () => {
      // Set up authenticated state for data operations
      mockUserStore.session = createMockSession();
      mockUserStore.isAuthenticated = true;
      mockOnboardingStore.secretKey = new Uint8Array(32).fill(1);

      const service = HomeserverService.getInstance();
      service['currentKeypair'] = Keypair.fromSecretKey(new Uint8Array(32).fill(1));
    });

    it('should fetch data (GET)', async () => {
      const service = HomeserverService.getInstance();
      const mockClient = service['client'] as unknown as MockClient;
      mockClient.fetch.mockResolvedValue(new Response('{"data": "test"}', { status: 200 }));

      const response = await service.fetch('https://example.com/data');

      expect(mockClient.fetch).toHaveBeenCalledWith('https://example.com/data', { credentials: 'include' });
      expect(response.status).toBe(200);
    });

    it('should create/update data (PUT)', async () => {
      const service = HomeserverService.getInstance();
      const mockClient = service['client'] as unknown as MockClient;
      mockClient.fetch.mockResolvedValue(new Response('OK', { status: 200 }));

      const response = await service.fetch('https://example.com/data', {
        method: 'PUT',
        body: JSON.stringify({ data: 'test' }),
      });

      expect(mockClient.fetch).toHaveBeenCalledWith('https://example.com/data', {
        method: 'PUT',
        body: JSON.stringify({ data: 'test' }),
        credentials: 'include',
      });
      expect(response.status).toBe(200);
    });

    it('should delete data (DELETE)', async () => {
      const service = HomeserverService.getInstance();
      const mockClient = service['client'] as unknown as MockClient;
      mockClient.fetch.mockResolvedValue(new Response('', { status: 200 }));

      const response = await service.fetch('https://example.com/data', {
        method: 'DELETE',
      });

      expect(mockClient.fetch).toHaveBeenCalledWith('https://example.com/data', {
        method: 'DELETE',
        credentials: 'include',
      });
      expect(response.status).toBe(200);
    });

    it('should handle fetch errors', async () => {
      const service = HomeserverService.getInstance();
      const mockClient = service['client'] as unknown as MockClient;
      mockClient.fetch.mockRejectedValue(new Error('Network error'));

      await expect(service.fetch('https://example.com/data')).rejects.toMatchObject({
        type: HomeserverErrorType.FETCH_FAILED,
        statusCode: 500,
      });
    });
  });

  describe('Edge Cases', () => {
    beforeEach(async () => {
      // Set up authenticated state for edge cases
      mockUserStore.session = createMockSession();
      mockUserStore.isAuthenticated = true;
      mockOnboardingStore.secretKey = new Uint8Array(32).fill(1);

      const service = HomeserverService.getInstance();
      service['currentKeypair'] = Keypair.fromSecretKey(new Uint8Array(32).fill(1));
    });

    it('should handle empty response data', async () => {
      const service = HomeserverService.getInstance();
      const mockClient = service['client'] as unknown as MockClient;
      mockClient.fetch.mockResolvedValue(new Response('', { status: 200 }));

      const response = await service.fetch('https://example.com/empty');

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('');
    });

    it('should handle different HTTP status codes', async () => {
      const service = HomeserverService.getInstance();
      const mockClient = service['client'] as unknown as MockClient;
      mockClient.fetch.mockResolvedValue(new Response('Not Found', { status: 404 }));

      const response = await service.fetch('https://example.com/notfound');

      expect(response.status).toBe(404);
    });

    it('should preserve credentials option', async () => {
      const service = HomeserverService.getInstance();
      const mockClient = service['client'] as unknown as MockClient;
      mockClient.fetch.mockResolvedValue(new Response('OK', { status: 200 }));

      await service.fetch('https://example.com/data', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
      });

      expect(mockClient.fetch).toHaveBeenCalledWith('https://example.com/data', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
        credentials: 'include',
      });
    });
  });

  describe('Session and Keypair State Management', () => {
    it('should track session after successful signup', async () => {
      const service = HomeserverService.getInstance();
      const keypair = Keypair.fromSecretKey(new Uint8Array(32).fill(1));

      const mockClient = service['client'] as unknown as MockClient;
      const mockSession = createMockSession();
      mockClient.signup.mockResolvedValue(mockSession);

      const result = await service.signup(keypair, 'test-token');

      expect(result.session).toBe(mockSession);
    });

    it('should clear keypair after logout', async () => {
      const service = HomeserverService.getInstance();

      // Set up authenticated state
      mockUserStore.session = createMockSession();
      mockUserStore.isAuthenticated = true;
      service['currentKeypair'] = Keypair.fromSecretKey(new Uint8Array(32).fill(1));

      const mockClient = service['client'] as unknown as MockClient;
      mockClient.signout.mockResolvedValue(undefined);

      await service.logout();

      expect(service['currentKeypair']).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should throw NOT_AUTHENTICATED error when fetching without session', async () => {
      const service = HomeserverService.getInstance();

      // Ensure not authenticated
      mockUserStore.session = null;
      mockUserStore.isAuthenticated = false;
      mockOnboardingStore.secretKey = new Uint8Array(0);

      await expect(service.fetch('https://example.com/data')).rejects.toMatchObject({
        type: HomeserverErrorType.NOT_AUTHENTICATED,
        statusCode: 401,
      });
    });

    it('should throw NOT_AUTHENTICATED error when logging out without session', async () => {
      const service = HomeserverService.getInstance();

      // Ensure not authenticated
      mockUserStore.session = null;
      mockUserStore.isAuthenticated = false;

      await expect(service.logout()).rejects.toMatchObject({
        type: HomeserverErrorType.NOT_AUTHENTICATED,
        statusCode: 401,
      });
    });

    it('should throw FETCH_FAILED error when fetch operation fails', async () => {
      const service = HomeserverService.getInstance();

      // Set up authenticated state
      mockUserStore.session = createMockSession();
      mockUserStore.isAuthenticated = true;
      mockOnboardingStore.secretKey = new Uint8Array(32).fill(1);
      service['currentKeypair'] = Keypair.fromSecretKey(new Uint8Array(32).fill(1));

      const mockClient = service['client'] as unknown as MockClient;
      mockClient.fetch.mockRejectedValue(new Error('Network error'));

      await expect(service.fetch('https://example.com/data')).rejects.toMatchObject({
        type: HomeserverErrorType.FETCH_FAILED,
        statusCode: 500,
      });
    });

    it('should throw LOGOUT_FAILED error when logout operation fails', async () => {
      const service = HomeserverService.getInstance();

      // Set up authenticated state
      mockUserStore.session = createMockSession();
      mockUserStore.isAuthenticated = true;
      service['currentKeypair'] = Keypair.fromSecretKey(new Uint8Array(32).fill(1));

      const mockClient = service['client'] as unknown as MockClient;
      mockClient.signout.mockRejectedValue(new Error('Server error'));

      await expect(service.logout()).rejects.toMatchObject({
        type: HomeserverErrorType.LOGOUT_FAILED,
        statusCode: 500,
      });
    });

    it('should throw SIGNUP_FAILED error when signup operation fails', async () => {
      const service = HomeserverService.getInstance();
      const keypair = Keypair.fromSecretKey(new Uint8Array(32).fill(1));

      const mockClient = service['client'] as unknown as MockClient;
      mockClient.signup.mockRejectedValue(new Error('Server error'));

      await expect(service.signup(keypair, 'test-token')).rejects.toMatchObject({
        type: HomeserverErrorType.SIGNUP_FAILED,
        statusCode: 500,
      });
    });
  });
});
