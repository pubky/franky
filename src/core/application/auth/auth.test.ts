import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import { LastReadResult } from 'pubky-app-specs';
import type { Session, Keypair } from '@synonymdev/pubky';

vi.mock('pubky-app-specs', () => ({
  default: vi.fn(() => Promise.resolve()),
}));

describe('AuthApplication', () => {
  const createMockInstance = () => ({
    signup: vi.fn(),
    authenticateKeypair: vi.fn(),
    generateAuthUrl: vi.fn(),
    logout: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    const createParams = (): Core.TAuthenticateKeypairParams => ({
      keypair: { pubky: 'test-pubky' as Core.Pubky, secretKey: 'test-secret-key-hex' },
      signupToken: 'test-signup-token',
      secretKey: 'test-secret-key',
      lastRead: {
        last_read: { toJson: vi.fn(() => ({ timestamp: 1234567890 })) },
        meta: { url: 'pubky://test-pubky/pub/pubky.app/last-read' },
      } as unknown as LastReadResult,
    });

    it('should sign up and update last read', async () => {
      const params = createParams();
      const mockInstance = createMockInstance();
      const mockSession = { token: 'test-token' } as unknown as Session;
      const expectedResult = { pubky: 'test-pubky' as Core.Pubky, session: mockSession };

      vi.spyOn(Core.HomeserverService, 'getInstance').mockReturnValue(
        mockInstance as unknown as Core.HomeserverService,
      );
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined);
      mockInstance.signup.mockResolvedValue(expectedResult);

      const result = await Core.AuthApplication.signUp(params);

      expect(mockInstance.signup).toHaveBeenCalledWith(params.keypair, params.signupToken);
      expect(requestSpy).toHaveBeenCalledWith(
        Core.HomeserverAction.PUT,
        params.lastRead.meta.url,
        params.lastRead.last_read.toJson(),
      );
      expect(result).toEqual(expectedResult);
    });

    it('should propagate error when signup fails', async () => {
      const params = createParams();
      const mockInstance = createMockInstance();
      vi.spyOn(Core.HomeserverService, 'getInstance').mockReturnValue(
        mockInstance as unknown as Core.HomeserverService,
      );
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request');
      mockInstance.signup.mockRejectedValue(new Error('Signup failed'));

      await expect(Core.AuthApplication.signUp(params)).rejects.toThrow('Signup failed');
      expect(mockInstance.signup).toHaveBeenCalledOnce();
      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('should propagate error when last read update fails', async () => {
      const params = createParams();
      const mockInstance = createMockInstance();
      const mockSession = { token: 'test-token' } as unknown as Session;
      vi.spyOn(Core.HomeserverService, 'getInstance').mockReturnValue(
        mockInstance as unknown as Core.HomeserverService,
      );
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request');

      mockInstance.signup.mockResolvedValue({ pubky: 'test-pubky' as Core.Pubky, session: mockSession });
      requestSpy.mockRejectedValue(new Error('Failed to update last read'));

      await expect(Core.AuthApplication.signUp(params)).rejects.toThrow('Failed to update last read');
      expect(mockInstance.signup).toHaveBeenCalledOnce();
      expect(requestSpy).toHaveBeenCalledOnce();
    });
  });

  describe('signIn', () => {
    const createParams = (): Core.THomeserverAuthenticateParams => ({
      keypair: {
        publicKey: vi.fn(() => ({ z32: () => 'test-pubky' })),
        secretKey: vi.fn(() => new Uint8Array([1, 2, 3])),
      } as unknown as Keypair,
      secretKey: 'test-secret-key',
    });

    it('should successfully authenticate and return result', async () => {
      const params = createParams();
      const mockInstance = createMockInstance();
      const mockSession = { token: 'test-token' } as unknown as Session;
      const expectedResult = { pubky: 'test-pubky' as Core.Pubky, session: mockSession };

      vi.spyOn(Core.HomeserverService, 'getInstance').mockReturnValue(
        mockInstance as unknown as Core.HomeserverService,
      );
      mockInstance.authenticateKeypair.mockResolvedValue(expectedResult);

      const result = await Core.AuthApplication.signIn(params);

      expect(mockInstance.authenticateKeypair).toHaveBeenCalledWith(params.keypair);
      expect(result).toEqual(expectedResult);
    });

    it('should return undefined when homeserver is not found during authentication', async () => {
      const params = createParams();
      const mockInstance = createMockInstance();
      vi.spyOn(Core.HomeserverService, 'getInstance').mockReturnValue(
        mockInstance as unknown as Core.HomeserverService,
      );
      mockInstance.authenticateKeypair.mockResolvedValue(undefined);

      const result = await Core.AuthApplication.signIn(params);

      expect(mockInstance.authenticateKeypair).toHaveBeenCalledWith(params.keypair);
      expect(result).toBeUndefined();
    });

    it('should propagate error when authentication throws', async () => {
      const params = createParams();
      const mockInstance = createMockInstance();
      vi.spyOn(Core.HomeserverService, 'getInstance').mockReturnValue(
        mockInstance as unknown as Core.HomeserverService,
      );
      mockInstance.authenticateKeypair.mockRejectedValue(new Error('Authentication failed'));

      await expect(Core.AuthApplication.signIn(params)).rejects.toThrow('Authentication failed');
      expect(mockInstance.authenticateKeypair).toHaveBeenCalledOnce();
    });
  });

  describe('generateAuthUrl', () => {
    it('should generate and return auth URL', async () => {
      const params = { secretKey: 'test-secret-key' };
      const mockInstance = createMockInstance();
      const expectedUrl = 'https://example.com/auth?token=test-token';

      vi.spyOn(Core.HomeserverService, 'getInstance').mockReturnValue(
        mockInstance as unknown as Core.HomeserverService,
      );
      mockInstance.generateAuthUrl.mockResolvedValue(expectedUrl);

      const result = await Core.AuthApplication.generateAuthUrl(params);

      expect(mockInstance.generateAuthUrl).toHaveBeenCalled();
      expect(result).toBe(expectedUrl);
    });

    it('should propagate error when URL generation fails', async () => {
      const params = { secretKey: 'test-secret-key' };
      const mockInstance = createMockInstance();
      vi.spyOn(Core.HomeserverService, 'getInstance').mockReturnValue(
        mockInstance as unknown as Core.HomeserverService,
      );
      mockInstance.generateAuthUrl.mockRejectedValue(new Error('Failed to generate auth URL'));

      await expect(Core.AuthApplication.generateAuthUrl(params)).rejects.toThrow('Failed to generate auth URL');
      expect(mockInstance.generateAuthUrl).toHaveBeenCalledOnce();
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      const params = { pubky: 'test-pubky' as Core.Pubky, secretKey: 'test-secret-key' };
      const mockInstance = createMockInstance();
      vi.spyOn(Core.HomeserverService, 'getInstance').mockReturnValue(
        mockInstance as unknown as Core.HomeserverService,
      );
      mockInstance.logout.mockResolvedValue(undefined);

      await Core.AuthApplication.logout(params);

      expect(mockInstance.logout).toHaveBeenCalledWith(params.pubky);
    });

    it('should propagate error when logout fails', async () => {
      const params = { pubky: 'test-pubky' as Core.Pubky, secretKey: 'test-secret-key' };
      const mockInstance = createMockInstance();
      vi.spyOn(Core.HomeserverService, 'getInstance').mockReturnValue(
        mockInstance as unknown as Core.HomeserverService,
      );
      mockInstance.logout.mockRejectedValue(new Error('Logout failed'));

      await expect(Core.AuthApplication.logout(params)).rejects.toThrow('Logout failed');
      expect(mockInstance.logout).toHaveBeenCalledOnce();
    });
  });
});
