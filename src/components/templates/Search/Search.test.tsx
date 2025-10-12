import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Search } from './Search';
import * as App from '@/app';

// Mock next/navigation - REQUIRED: external dependency
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
}));

// Mock organisms - REQUIRED: complex components with their own dependencies
vi.mock('@/organisms', () => ({
  ContentLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="content-layout">{children}</div>,
  DialogWelcome: ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) =>
    isOpen ? (
      <div data-testid="dialog-welcome" onClick={() => onOpenChange(false)}>
        Mocked DialogWelcome
      </div>
    ) : null,
}));

// Mock molecules - REQUIRED: complex filter components
vi.mock('@/molecules', () => ({
  FilterReach: ({ selectedTab }: { selectedTab: string }) => (
    <div data-testid="filter-reach">FilterReach: {selectedTab}</div>
  ),
  FilterSort: ({ selectedTab }: { selectedTab: string }) => (
    <div data-testid="filter-sort">FilterSort: {selectedTab}</div>
  ),
  FilterContent: ({ selectedTab }: { selectedTab: string }) => (
    <div data-testid="filter-content">FilterContent: {selectedTab}</div>
  ),
  FilterLayout: ({ selectedTab }: { selectedTab: string }) => (
    <div data-testid="filter-layout">FilterLayout: {selectedTab}</div>
  ),
  WhoToFollow: () => <div data-testid="who-to-follow">Who to Follow</div>,
  ActiveUsers: () => <div data-testid="active-users">Active Users</div>,
  HotTags: ({ tags }: { tags: string[] }) => <div data-testid="hot-tags">Hot Tags: {tags.join(', ')}</div>,
  FeedbackCard: () => <div data-testid="feedback-card">Feedback Card</div>,
}));

// Mock the Core module - REQUIRED: stores
vi.mock('@/core', () => ({
  useFiltersStore: vi.fn(() => ({
    layout: 'columns',
    setLayout: vi.fn(),
    reach: 'all',
    setReach: vi.fn(),
    sort: 'recent',
    setSort: vi.fn(),
    content: 'all',
    setContent: vi.fn(),
  })),
}));

// Mock hooks - REQUIRED: custom hooks
vi.mock('@/hooks', () => ({
  useLayoutReset: vi.fn(),
}));

describe('Search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    render(<Search />);
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('displays the Search heading correctly', () => {
    render(<Search />);
    const heading = screen.getByText('Search');
    expect(heading).toBeInTheDocument();
  });

  it('displays welcome message', () => {
    render(<Search />);
    expect(screen.getByText('Welcome to the Search page. Search for posts, users, and tags.')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(<Search />);
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveAttribute('id', 'search-logout-btn');
  });

  it('navigates to logout page when logout button is clicked', async () => {
    const { useRouter } = await import('next/navigation');
    const mockPush = vi.fn();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });

    render(<Search />);
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockPush).toHaveBeenCalledWith(App.AUTH_ROUTES.LOGOUT);
  });

  it('renders container structure correctly', () => {
    render(<Search />);
    expect(screen.getByTestId('content-layout')).toBeInTheDocument();
  });
});
