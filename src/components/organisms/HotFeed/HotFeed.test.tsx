import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HotFeed } from './HotFeed';

// Mock Core
vi.mock('@/core', () => ({
  useHomeStore: vi.fn(() => ({
    reach: 'following',
    setReach: vi.fn(),
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
}));

// Mock Atoms
vi.mock('@/atoms', () => ({
  Heading: ({ children, level }: { children: React.ReactNode; level: number }) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    return <Tag data-testid={`heading-${level}`}>{children}</Tag>;
  },
  Typography: ({ children }: { children: React.ReactNode }) => <p data-testid="typography">{children}</p>,
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
}));

describe('HotFeed', () => {
  it('renders without errors', () => {
    render(<HotFeed />);
    expect(screen.getByTestId('content-layout')).toBeInTheDocument();
  });

  it('displays Hot heading', () => {
    render(<HotFeed />);
    expect(screen.getByText('Hot')).toBeInTheDocument();
  });

  it('displays description text', () => {
    render(<HotFeed />);
    expect(
      screen.getByText('Discover trending posts and popular content from across the network.'),
    ).toBeInTheDocument();
  });

  it('renders content cards', () => {
    render(<HotFeed />);
    expect(screen.getByText("What's Hot")).toBeInTheDocument();
    expect(screen.getByText('Trending Topics')).toBeInTheDocument();
    expect(screen.getByText('Popular Posts')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HotFeed />);
    expect(container).toMatchSnapshot();
  });
});
