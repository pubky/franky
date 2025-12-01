import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileTagged } from './ProfileTagged';

// Mock hooks
vi.mock('@/hooks', () => ({
  useCurrentUserProfile: () => ({
    userDetails: { name: 'Satoshi' },
    currentUserPubky: 'test-user-pubky',
  }),
  useTagged: () => ({
    tags: [
      {
        label: 'bitcoin',
        taggers: [{ id: 'user1', avatarUrl: 'https://cdn.example.com/avatar/user1' }],
        taggers_count: 1,
        relationship: false,
      },
    ],
    count: 1,
    isLoading: false,
    isLoadingMore: false,
    hasMore: false,
    loadMore: vi.fn(),
    handleTagAdd: vi.fn().mockResolvedValue({ success: true }),
    handleTagToggle: vi.fn(),
  }),
}));

// Mock molecules
vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    TaggedSection: () => <div data-testid="tagged-section">TaggedSection</div>,
    TaggedEmpty: () => <div data-testid="tagged-empty">TaggedEmpty</div>,
  };
});

describe('ProfileTagged', () => {
  it('renders TaggedSection when tags exist', () => {
    render(<ProfileTagged />);
    expect(screen.getByTestId('tagged-section')).toBeInTheDocument();
  });

  it('renders tag count heading', () => {
    render(<ProfileTagged />);
    expect(screen.getByText('Tagged (1)')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfileTagged />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('ProfileTagged - Loading State', () => {
  it('renders loading state when isLoading is true', () => {
    vi.doMock('@/hooks', () => ({
      useCurrentUserProfile: () => ({
        userDetails: { name: 'Satoshi' },
        currentUserPubky: 'test-user-pubky',
      }),
      useTagged: () => ({
        tags: [],
        count: 0,
        isLoading: true,
        isLoadingMore: false,
        hasMore: false,
        loadMore: vi.fn(),
        handleTagAdd: vi.fn(),
        handleTagToggle: vi.fn(),
      }),
    }));
  });
});

describe('ProfileTagged - Empty State', () => {
  it('renders empty state when no tags', async () => {
    vi.doMock('@/hooks', () => ({
      useCurrentUserProfile: () => ({
        userDetails: { name: 'Satoshi' },
        currentUserPubky: 'test-user-pubky',
      }),
      useTagged: () => ({
        tags: [],
        count: 0,
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        loadMore: vi.fn(),
        handleTagAdd: vi.fn(),
        handleTagToggle: vi.fn(),
      }),
    }));
  });
});
