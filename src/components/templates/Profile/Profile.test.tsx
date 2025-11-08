import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Profile } from './Profile';
import { ProfileCounts } from '@/molecules/ProfileMenu/profileMenu.shared';

// Mock dependencies
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useLayoutReset: vi.fn(),
    useClickOutside: vi.fn(),
    useCopyToClipboard: vi.fn(() => ({
      copyToClipboard: vi.fn(),
    })),
  };
});

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile/posts',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock database
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => undefined,
}));

describe('Profile', () => {
  it('renders children', () => {
    render(
      <Profile>
        <div>Profile Content</div>
      </Profile>,
    );
    expect(screen.getByText('Profile Content')).toBeInTheDocument();
  });

  it('renders with profile counts', () => {
    const counts: ProfileCounts = {
      notifications: 3,
      posts: 10,
      replies: 5,
      followers: 100,
      following: 50,
      friends: 20,
      tagged: 3,
    };
    render(
      <Profile profileCounts={counts}>
        <div>Profile Content</div>
      </Profile>,
    );
    expect(screen.getByText('Profile Content')).toBeInTheDocument();
  });
});
