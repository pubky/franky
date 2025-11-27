import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageSidebar } from './ProfilePageSidebar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(() => null),
}));

// Mock @/core
vi.mock('@/core', () => ({
  useAuthStore: vi.fn(() => ({
    currentUserPubky: 'test-pubky-123',
  })),
  ProfileController: {
    read: vi.fn().mockResolvedValue({
      links: [
        { title: 'Example Link', url: 'https://example.com' },
        { title: 'GitHub', url: 'https://github.com/test' },
      ],
    }),
  },
}));

// Mock @/libs/icons
vi.mock('@/libs/icons', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs/icons')>();
  return {
    ...actual,
    getIconFromUrl: () => {
      const MockIcon = ({ size, className }: { size: number; className: string }) => (
        <span data-testid="mock-icon" data-size={size} className={className}>
          Icon
        </span>
      );
      return MockIcon;
    },
  };
});

// Mock @/hooks
vi.mock('@/hooks', () => ({
  useCurrentUserProfile: vi.fn(() => ({
    userDetails: null,
    currentUserPubky: 'test-pubky-123',
  })),
  useUserTags: vi.fn(() => []),
}));

describe('ProfilePageSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ProfilePageTaggedAs component', () => {
    render(<ProfilePageSidebar />);
    expect(screen.getByText('Tagged as')).toBeInTheDocument();
  });

  it('renders ProfilePageLinks component', () => {
    render(<ProfilePageSidebar />);
    expect(screen.getByText('Links')).toBeInTheDocument();
  });

  it('renders FeedbackCard component', () => {
    render(<ProfilePageSidebar />);
    expect(screen.getByTestId('feedback-card')).toBeInTheDocument();
  });

  it('has correct structure with sticky positioning', () => {
    const { container } = render(<ProfilePageSidebar />);
    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement).toHaveClass(
      'sticky',
      'top-(--header-height)',
      'hidden',
      'w-(--filter-bar-width)',
      'flex-col',
      'gap-6',
      'self-start',
      'lg:flex',
    );
  });

  it('renders with empty tags initially', () => {
    render(<ProfilePageSidebar />);
    expect(screen.getByText('No tags added yet.')).toBeInTheDocument();
  });

  it('renders heading and container structure', () => {
    render(<ProfilePageSidebar />);
    expect(screen.getByText('Tagged as')).toBeInTheDocument();
    expect(screen.getByText('Links')).toBeInTheDocument();
  });
});

describe('ProfilePageSidebar - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot with default state', () => {
    const { container } = render(<ProfilePageSidebar />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot structure', () => {
    const { container } = render(<ProfilePageSidebar />);
    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement.tagName).toBe('DIV');
    expect(rootElement.children.length).toBe(3);
  });
});
