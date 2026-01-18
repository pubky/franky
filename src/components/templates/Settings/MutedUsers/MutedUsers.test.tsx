import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MutedUsers } from './MutedUsers';

const { mockUseMutedUsers, mockUseBulkUserAvatars, mockUseMuteUser } = vi.hoisted(() => ({
  mockUseMutedUsers: vi.fn(),
  mockUseBulkUserAvatars: vi.fn(),
  mockUseMuteUser: vi.fn(),
}));

vi.mock('@/hooks', () => ({
  useMutedUsers: () => mockUseMutedUsers(),
  useBulkUserAvatars: (ids: string[]) => mockUseBulkUserAvatars(ids),
  useMuteUser: () => mockUseMuteUser(),
}));

describe('MutedUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutedUsers.mockReturnValue({
      mutedUserIds: [],
      mutedUserIdSet: new Set(),
      isMuted: vi.fn(() => false),
      isLoading: false,
    });
    mockUseBulkUserAvatars.mockReturnValue({
      usersMap: new Map(),
      isLoading: false,
    });
    mockUseMuteUser.mockReturnValue({
      toggleMute: vi.fn(),
      isLoading: false,
      isUserLoading: vi.fn(() => false),
      error: null,
    });
  });

  it('renders with default props', () => {
    render(<MutedUsers />);
    expect(screen.getByText('Muted users')).toBeInTheDocument();
  });

  it('renders empty state when no muted users', () => {
    render(<MutedUsers />);
    expect(screen.getByText('No muted users yet')).toBeInTheDocument();
  });
});

describe('MutedUsers - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutedUsers.mockReturnValue({
      mutedUserIds: [],
      mutedUserIdSet: new Set(),
      isMuted: vi.fn(() => false),
      isLoading: false,
    });
    mockUseBulkUserAvatars.mockReturnValue({
      usersMap: new Map(),
      isLoading: false,
    });
    mockUseMuteUser.mockReturnValue({
      toggleMute: vi.fn(),
      isLoading: false,
      isUserLoading: vi.fn(() => false),
      error: null,
    });
  });

  it('matches snapshot with no muted users', () => {
    const { container } = render(<MutedUsers />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
