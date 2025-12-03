import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  HomeFeedRightSidebar,
  HomeFeedRightDrawer,
  HomeFeedRightDrawerMobile,
  HotFeedRightSidebar,
  HotFeedRightDrawer,
} from './FeedRightSidebar';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock useHotTags hook
vi.mock('@/hooks', () => ({
  useHotTags: () => ({
    tags: [
      { name: 'bitcoin', count: 10 },
      { name: 'pubky', count: 5 },
    ],
    isLoading: false,
    error: null,
  }),
}));

// Mock Molecules
vi.mock('@/molecules', () => ({
  HotTags: ({ tags }: { tags: { name: string; count: number }[] }) => (
    <div data-testid="hot-tags">{tags.length} tags</div>
  ),
  FeedSection: () => <div data-testid="feed-section">FeedSection</div>,
}));

// Mock Organisms - WhoToFollow and ActiveUsers were moved from molecules to organisms
vi.mock('@/organisms', () => ({
  WhoToFollow: () => <div data-testid="who-to-follow">WhoToFollow</div>,
  ActiveUsers: () => <div data-testid="active-users">ActiveUsers</div>,
  FeedbackCard: () => <div data-testid="feedback-card">FeedbackCard</div>,
}));

// Mock Libs icons and utilities
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    UsersRound: () => <span>UsersRound</span>,
    Pencil: () => <span>Pencil</span>,
  };
});

describe('HomeFeedRightSidebar', () => {
  it('renders all components', () => {
    render(<HomeFeedRightSidebar />);

    expect(screen.getByTestId('who-to-follow')).toBeInTheDocument();
    expect(screen.getByTestId('active-users')).toBeInTheDocument();
    expect(screen.getByTestId('hot-tags')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-card')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HomeFeedRightSidebar />);
    expect(container).toMatchSnapshot();
  });
});

describe('HomeFeedRightDrawer', () => {
  it('renders all components', () => {
    render(<HomeFeedRightDrawer />);

    expect(screen.getByTestId('who-to-follow')).toBeInTheDocument();
    expect(screen.getByTestId('active-users')).toBeInTheDocument();
    expect(screen.getByTestId('hot-tags')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-card')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HomeFeedRightDrawer />);
    expect(container).toMatchSnapshot();
  });
});

describe('HomeFeedRightDrawerMobile', () => {
  it('renders FeedSection', () => {
    render(<HomeFeedRightDrawerMobile />);

    expect(screen.getByTestId('feed-section')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HomeFeedRightDrawerMobile />);
    expect(container).toMatchSnapshot();
  });
});

describe('HotFeedRightSidebar', () => {
  it('renders WhoToFollow and FeedbackCard', () => {
    render(<HotFeedRightSidebar />);

    expect(screen.getByTestId('who-to-follow')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-card')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HotFeedRightSidebar />);
    expect(container).toMatchSnapshot();
  });
});

describe('HotFeedRightDrawer', () => {
  it('renders WhoToFollow and FeedbackCard', () => {
    render(<HotFeedRightDrawer />);

    expect(screen.getByTestId('who-to-follow')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-card')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HotFeedRightDrawer />);
    expect(container).toMatchSnapshot();
  });
});
