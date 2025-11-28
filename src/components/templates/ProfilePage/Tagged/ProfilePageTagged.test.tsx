import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageTagged } from './ProfilePageTagged';

// Mock hooks
vi.mock('@/hooks', () => ({
  useCurrentUserProfile: () => ({
    currentUserPubky: 'test-pubky',
  }),
  useTagged: () => ({
    tags: [],
    isLoading: false,
  }),
  useProfileStats: () => ({
    stats: {
      uniqueTags: 3,
      notifications: 0,
      posts: 0,
      replies: 0,
      followers: 0,
      following: 0,
      friends: 0,
    },
  }),
}));

// Mock TaggedEmpty and TaggedSection
vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    TaggedEmpty: () => <div data-testid="tagged-empty">TaggedEmpty</div>,
    TaggedSection: () => <div data-testid="tagged-section">TaggedSection</div>,
  };
});

describe('ProfilePageTagged', () => {
  it('renders without errors', () => {
    const { container } = render(<ProfilePageTagged />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders TaggedEmpty when no tags', () => {
    render(<ProfilePageTagged />);
    expect(screen.getByTestId('tagged-empty')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePageTagged />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
