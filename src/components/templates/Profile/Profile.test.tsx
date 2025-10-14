import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Profile } from './Profile';

// Mock dependencies
vi.mock('@/hooks', () => ({
  useLayoutReset: vi.fn(),
  useClickOutside: vi.fn(),
}));

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
    const counts = {
      posts: 10,
      replies: 5,
      tagged: 3,
      followers: 100,
      following: 50,
      friends: 20,
    };
    render(
      <Profile profileCounts={counts}>
        <div>Profile Content</div>
      </Profile>,
    );
    expect(screen.getByText('Profile Content')).toBeInTheDocument();
  });
});
