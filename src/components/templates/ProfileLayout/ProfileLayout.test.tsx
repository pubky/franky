import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileLayout } from './ProfileLayout';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  usePathname: vi.fn(() => '/profile/posts'),
}));

// Mock hooks
vi.mock('@/hooks', () => ({
  useLayoutReset: vi.fn(),
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  ContentLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="content-layout">{children}</div>,
  ProfileHeader: () => <div data-testid="profile-header">Profile Header</div>,
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  ProfileTabsMobile: () => <div data-testid="profile-tabs-mobile">Tabs</div>,
  ProfileAvatar: () => <div data-testid="profile-avatar">Avatar</div>,
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ProfileLayout', () => {
  it('renders without errors', () => {
    render(
      <ProfileLayout>
        <div>Test content</div>
      </ProfileLayout>,
    );
    expect(screen.getByTestId('content-layout')).toBeInTheDocument();
  });

  it('renders ProfileHeader', () => {
    render(
      <ProfileLayout>
        <div>Test content</div>
      </ProfileLayout>,
    );
    expect(screen.getByTestId('profile-header')).toBeInTheDocument();
  });

  it('renders mobile tabs', () => {
    render(
      <ProfileLayout>
        <div>Test content</div>
      </ProfileLayout>,
    );
    expect(screen.getByTestId('profile-tabs-mobile')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <ProfileLayout>
        <div data-testid="test-child">Test content</div>
      </ProfileLayout>,
    );
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});
