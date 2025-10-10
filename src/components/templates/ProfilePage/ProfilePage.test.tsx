import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePage } from './ProfilePage';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock hooks
vi.mock('@/hooks', () => ({
  useLayoutReset: vi.fn(),
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  ContentLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="content-layout">{children}</div>,
  ProfileHeader: ({ name }: { name: string }) => <div data-testid="profile-header">{name}</div>,
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  ProfileTabsMobile: () => <div data-testid="profile-tabs-mobile">Tabs</div>,
  EmptyState: () => <div data-testid="empty-state">Empty</div>,
  ProfileAvatar: () => <div data-testid="profile-avatar">Avatar</div>,
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ProfilePage', () => {
  it('renders without errors', () => {
    render(<ProfilePage />);
    expect(screen.getByTestId('content-layout')).toBeInTheDocument();
  });

  it('renders ProfileHeader with mock user data', () => {
    render(<ProfilePage />);
    expect(screen.getByTestId('profile-header')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders mobile tabs', () => {
    render(<ProfilePage />);
    expect(screen.getByTestId('profile-tabs-mobile')).toBeInTheDocument();
  });

  it('renders empty state for default tab (posts)', () => {
    render(<ProfilePage />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders container structure correctly', () => {
    render(<ProfilePage />);
    expect(screen.getByTestId('content-layout')).toBeInTheDocument();
  });
});
