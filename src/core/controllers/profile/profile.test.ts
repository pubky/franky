import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserResult } from 'pubky-app-specs';
import type { Pubky } from '@/core/models/models.types';

const mockProfileApplication = {
  create: vi.fn(),
};

const mockUserNormalizer = {
  to: vi.fn(),
  linksFromUi: vi.fn((links) =>
    (links ?? []).map((link: { label: string; url: string }) => ({ title: link.label, url: link.url })),
  ),
};

vi.mock('@/core', async () => {
  const actual = await vi.importActual('@/core');
  return {
    ...actual,
    ProfileApplication: mockProfileApplication,
    UserNormalizer: mockUserNormalizer,
  };
});
const testPubky = 'o4dksfbqk85ogzdb5osziw6befigbuxmuxkuxq8434q89uj56uyy' as Pubky;

let ProfileController: typeof import('./profile').ProfileController;

describe('ProfileController', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    mockProfileApplication.create.mockReset();
    mockUserNormalizer.to.mockReset();

    ({ ProfileController } = await import('./profile'));
  });

  describe('create', () => {
    it('normalizes profile data and delegates to application layer', async () => {
      const profile = {
        name: 'Test User',
        bio: 'Short bio',
        links: [{ label: 'Docs', url: 'https://example.com' }],
      };
      const userResult = {
        user: { toJson: vi.fn() },
        meta: { url: 'user-url' },
      };

      mockUserNormalizer.to.mockReturnValue(userResult as unknown as UserResult);
      mockProfileApplication.create.mockResolvedValue(undefined);

      await ProfileController.create(
        profile as { name: string; bio?: string; links?: { label: string; url: string }[] },
        'image-url',
        testPubky,
      );

      expect(mockUserNormalizer.to).toHaveBeenCalledTimes(1);
      expect(mockUserNormalizer.to).toHaveBeenCalledWith(
        {
          name: 'Test User',
          bio: 'Short bio',
          image: 'image-url',
          links: [{ title: 'Docs', url: 'https://example.com' }],
          status: '',
        },
        testPubky,
      );

      expect(mockProfileApplication.create).toHaveBeenCalledWith({
        profile: userResult.user,
        url: userResult.meta.url,
        pubky: testPubky,
      });
    });

    it('defaults optional fields when not provided', async () => {
      const profile = {
        name: 'Test User',
      };
      const userResult = {
        user: { toJson: vi.fn() },
        meta: { url: 'user-url' },
      };

      mockUserNormalizer.to.mockReturnValue(userResult as unknown as UserResult);
      mockProfileApplication.create.mockResolvedValue(undefined);

      await ProfileController.create(
        profile as { name: string; bio?: string; links?: { label: string; url: string }[] },
        null,
        testPubky,
      );

      expect(mockUserNormalizer.to).toHaveBeenCalledWith(
        {
          name: 'Test User',
          bio: '',
          image: '',
          links: [],
          status: '',
        },
        testPubky,
      );

      expect(mockProfileApplication.create).toHaveBeenCalledWith({
        profile: userResult.user,
        url: userResult.meta.url,
        pubky: testPubky,
      });
    });

    it('propagates errors from the user normalizer', async () => {
      const profile = {
        name: 'Test User',
        bio: 'Short bio',
      };
      const error = new Error('validation failed');

      mockUserNormalizer.to.mockImplementation(() => {
        throw error;
      });

      await expect(
        ProfileController.create(
          profile as { name: string; bio?: string; links?: { label: string; url: string }[] },
          null,
          testPubky,
        ),
      ).rejects.toThrow('validation failed');
      expect(mockProfileApplication.create).not.toHaveBeenCalled();
    });

    it('propagates errors from the application layer', async () => {
      const profile = {
        name: 'Test User',
        bio: 'Short bio',
      };
      const userResult = {
        user: { toJson: vi.fn() },
        meta: { url: 'user-url' },
      };

      mockUserNormalizer.to.mockReturnValue(userResult as unknown as UserResult);
      mockProfileApplication.create.mockRejectedValue(new Error('create failed'));

      await expect(
        ProfileController.create(
          profile as { name: string; bio?: string; links?: { label: string; url: string }[] },
          null,
          testPubky,
        ),
      ).rejects.toThrow('create failed');
    });
  });
});
