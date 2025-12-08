import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HotFeed } from './HotFeed';

// Mock Core
vi.mock('@/core', () => ({
  useHotStore: vi.fn(() => ({
    reach: 'all',
    setReach: vi.fn(),
    timeframe: 'today',
    setTimeframe: vi.fn(),
  })),
}));

// Mock Hooks
vi.mock('@/hooks', () => ({
  useLayoutReset: vi.fn(),
}));

// Mock Organisms
vi.mock('@/organisms', () => ({
  ContentLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="content-layout">{children}</div>,
  HotFeedSidebar: () => <div data-testid="hot-feed-sidebar">HotFeedSidebar</div>,
  HotFeedRightSidebar: () => <div data-testid="hot-feed-right-sidebar">HotFeedRightSidebar</div>,
  HotFeedDrawer: () => <div data-testid="hot-feed-drawer">HotFeedDrawer</div>,
  HotFeedRightDrawer: () => <div data-testid="hot-feed-right-drawer">HotFeedRightDrawer</div>,
  HotTagsCardsSection: () => <div data-testid="hot-tags-cards-section">HotTagsCardsSection</div>,
  HotTagsOverview: () => <div data-testid="hot-tags-overview">HotTagsOverview</div>,
  HotActiveUsers: () => <div data-testid="hot-active-users">HotActiveUsers</div>,
  TimelineFeed: () => <div data-testid="timeline-feed">TimelineFeed</div>,
}));

// Mock Atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="container" {...props}>
      {children}
    </div>
  ),
  Heading: ({ children, level }: { children: React.ReactNode; level: number }) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    return <Tag data-testid={`heading-${level}`}>{children}</Tag>;
  },
}));

describe('HotFeed', () => {
  it('renders without errors', () => {
    render(<HotFeed />);
    expect(screen.getByTestId('content-layout')).toBeInTheDocument();
  });

  it('renders HotTagsCardsSection', () => {
    render(<HotFeed />);
    expect(screen.getByTestId('hot-tags-cards-section')).toBeInTheDocument();
  });

  it('renders HotTagsOverview', () => {
    render(<HotFeed />);
    expect(screen.getByTestId('hot-tags-overview')).toBeInTheDocument();
  });

  it('renders HotActiveUsers', () => {
    render(<HotFeed />);
    expect(screen.getByTestId('hot-active-users')).toBeInTheDocument();
  });

  it('renders TimelineFeed for trending posts', () => {
    render(<HotFeed />);
    expect(screen.getByTestId('timeline-feed')).toBeInTheDocument();
  });

  it('displays Trending posts heading', () => {
    render(<HotFeed />);
    expect(screen.getByText('Trending posts')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HotFeed />);
    expect(container).toMatchSnapshot();
  });
});
