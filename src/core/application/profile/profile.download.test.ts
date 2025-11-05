import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Pubky } from '@/core';

// Avoid pulling WASM-heavy deps from type-only modules
vi.mock('pubky-app-specs', () => ({
  baseUriBuilder: (pubky: string) => `pubky://${pubky}/pub/pubky.app/`,
}));

// Mock the Env module
vi.mock('@/libs/env', () => ({
  Env: {
    NEXT_PUBLIC_HOMESERVER_ADMIN_URL: 'http://test-admin.com',
    NEXT_PUBLIC_HOMESERVER_ADMIN_PASSWORD: 'test-password',
  },
}));

// Mock HomeserverService methods
vi.mock('@/core/services/homeserver', () => ({
  HomeserverService: {
    list: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock JSZip
vi.mock('jszip', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      folder: vi.fn().mockReturnValue({
        file: vi.fn(),
      }),
      generateAsync: vi.fn().mockResolvedValue(new Blob(['test'])),
    })),
  };
});

// Mock DOM APIs
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks();

  // Setup DOM mocks
  const mockElement = {
    href: '',
    download: '',
    click: mockClick,
  };
  mockCreateElement.mockReturnValue(mockElement);

  global.document = {
    createElement: mockCreateElement,
    body: {
      appendChild: mockAppendChild,
      removeChild: mockRemoveChild,
    },
  } as unknown as Document;

  global.URL = {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  } as unknown as typeof URL;
});

let ProfileApplication: typeof import('./profile').ProfileApplication;
let Core: typeof import('@/core');

beforeEach(async () => {
  vi.resetModules();
  Core = await import('@/core');
  ({ ProfileApplication } = await import('./profile'));
});

describe('ProfileApplication.downloadData', () => {
  const pubky = 'test-pubky' as Pubky;

  it('should pass Infinity as limit to HomeserverService.list', async () => {
    const listSpy = vi.spyOn(Core.HomeserverService, 'list').mockResolvedValue(['file1.json', 'file2.json']);
    const mockResponse = new Response('{}', { status: 200 });
    vi.spyOn(Core.HomeserverService, 'get').mockResolvedValue(mockResponse);

    await ProfileApplication.downloadData({ pubky });

    expect(listSpy).toHaveBeenCalledWith(`pubky://${pubky}/pub/pubky.app/`, undefined, false, Infinity);
  });

  it('should propagate error when list fails', async () => {
    vi.spyOn(Core.HomeserverService, 'list').mockRejectedValue(new Error('list failed'));
    const getSpy = vi.spyOn(Core.HomeserverService, 'get');

    await expect(ProfileApplication.downloadData({ pubky })).rejects.toThrow('list failed');

    expect(getSpy).not.toHaveBeenCalled();
  });
});
