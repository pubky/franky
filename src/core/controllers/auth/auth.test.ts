import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthController } from './auth';
import { HomeserverService, User, NexusUserDetails } from '@/core';

// Mock fetch globalmente
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('AuthController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getKeypair', () => {
    it('should return current keypair if exists', async () => {
      const homeserverService = HomeserverService.getInstance();

      // Generate a keypair first
      const keypair = homeserverService.generateRandomKeypair();

      // Spy on the method
      const spy = vi.spyOn(homeserverService, 'getCurrentKeypair');

      const result = await AuthController.getKeypair();

      expect(spy).toHaveBeenCalled();
      expect(result).toBe(keypair);

      spy.mockRestore();
    });

    it('should return null if no keypair exists', async () => {
      const homeserverService = HomeserverService.getInstance();

      // Clear any existing keypair
      homeserverService['currentKeypair'] = null;

      // Spy on the method
      const spy = vi.spyOn(homeserverService, 'getCurrentKeypair');

      const result = await AuthController.getKeypair();

      expect(spy).toHaveBeenCalled();
      expect(result).toBeNull();

      spy.mockRestore();
    });
  });

  describe('signUp', () => {
    it('should successfully sign up a user', async () => {
      const mockUserDetails: NexusUserDetails = {
        name: 'Test User',
        bio: 'Test Bio',
        id: 'test-id',
        links: null,
        status: null,
        image: null,
        indexed_at: Date.now(),
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue('mock-token'),
      });

      const homeserverService = HomeserverService.getInstance();
      const generateKeypairSpy = vi.spyOn(homeserverService, 'generateRandomKeypair');
      const signupSpy = vi.spyOn(homeserverService, 'signup').mockResolvedValue({
        session: {} as unknown as import('@synonymdev/pubky').Session,
      });
      const insertSpy = vi.spyOn(User, 'insert').mockImplementation(async (user) => {
        return new User({
          id: 'mock-public-key',
          details: user.details,
          counts: user.counts,
          tags: user.tags,
          relationship: user.relationship,
          following: [],
          followers: [],
          muted: [],
          indexed_at: null,
          updated_at: Date.now(),
          sync_status: 'local',
          sync_ttl: Date.now() + 300000,
        });
      });

      const result = await AuthController.signUp(mockUserDetails);

      expect(fetchMock).toHaveBeenCalled();
      expect(generateKeypairSpy).toHaveBeenCalled();
      expect(signupSpy).toHaveBeenCalled();
      expect(insertSpy).toHaveBeenCalled();
      expect(result).toEqual({
        session: {},
      });

      generateKeypairSpy.mockRestore();
      signupSpy.mockRestore();
      insertSpy.mockRestore();
    });

    it('should throw error if token generation fails', async () => {
      const mockUserDetails: NexusUserDetails = {
        name: 'Test User',
        bio: 'Test Bio',
        id: 'test-id',
        links: null,
        status: null,
        image: null,
        indexed_at: Date.now(),
      };

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: vi.fn().mockResolvedValue('Unauthorized'),
      });

      await expect(AuthController.signUp(mockUserDetails)).rejects.toThrow('Failed to generate signup token');
      expect(fetchMock).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const homeserverService = HomeserverService.getInstance();

      // Ensure there's a keypair
      homeserverService.generateRandomKeypair();

      const getCurrentKeypairSpy = vi.spyOn(homeserverService, 'getCurrentKeypair');
      const logoutSpy = vi.spyOn(homeserverService, 'logout').mockResolvedValue(undefined);

      await AuthController.logout();

      expect(getCurrentKeypairSpy).toHaveBeenCalled();
      expect(logoutSpy).toHaveBeenCalled();

      getCurrentKeypairSpy.mockRestore();
      logoutSpy.mockRestore();
    });

    it('should throw error if no keypair exists', async () => {
      const homeserverService = HomeserverService.getInstance();

      // Clear any existing keypair
      homeserverService['currentKeypair'] = null;

      const getCurrentKeypairSpy = vi.spyOn(homeserverService, 'getCurrentKeypair');

      await expect(AuthController.logout()).rejects.toThrow('No keypair available');
      expect(getCurrentKeypairSpy).toHaveBeenCalled();

      getCurrentKeypairSpy.mockRestore();
    });
  });
});
