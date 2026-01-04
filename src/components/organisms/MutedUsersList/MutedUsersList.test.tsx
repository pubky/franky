import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MutedUsersList } from './MutedUsersList';

// Hoist mock functions
const {
  mockRemoveMutedUser,
  mockClearMutedUsers,
  mockUseSettingsStore,
  mockUseMutedUsers,
  mockUnmuteUser,
  mockIsUserLoading,
  mockToast,
} = vi.hoisted(() => ({
  mockRemoveMutedUser: vi.fn(),
  mockClearMutedUsers: vi.fn(),
  mockUseSettingsStore: vi.fn(),
  mockUseMutedUsers: vi.fn(),
  mockUnmuteUser: vi.fn().mockResolvedValue(undefined),
  mockIsUserLoading: vi.fn(() => false),
  mockToast: vi.fn(),
}));

vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    useSettingsStore: () => mockUseSettingsStore(),
  };
});

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useMutedUsers: () => mockUseMutedUsers(),
    useMuteUser: () => ({
      unmuteUser: mockUnmuteUser,
      isLoading: false,
      isUserLoading: mockIsUserLoading,
    }),
  };
});

vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    toast: mockToast,
  };
});

describe('MutedUsersList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no muted users', () => {
    mockUseSettingsStore.mockReturnValue({
      muted: [],
      removeMutedUser: mockRemoveMutedUser,
      clearMutedUsers: mockClearMutedUsers,
    });
    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [],
      isLoading: false,
    });

    render(<MutedUsersList />);
    expect(screen.getByText('No muted users yet')).toBeInTheDocument();
  });

  it('renders muted user with unmute button', () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-123'],
      removeMutedUser: mockRemoveMutedUser,
      clearMutedUsers: mockClearMutedUsers,
    });
    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [
        {
          id: 'user-123',
          name: undefined,
          avatarUrl: undefined,
        },
      ],
      isLoading: false,
    });

    render(<MutedUsersList />);
    expect(screen.getByText('Unknown User')).toBeInTheDocument();
    expect(screen.getByText('user-123')).toBeInTheDocument();
    expect(screen.getByText('Unmute')).toBeInTheDocument();
  });

  it('calls removeMutedUser when clicking unmute', () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-123'],
      removeMutedUser: mockRemoveMutedUser,
      clearMutedUsers: mockClearMutedUsers,
    });
    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [
        {
          id: 'user-123',
          name: undefined,
          avatarUrl: undefined,
        },
      ],
      isLoading: false,
    });

    render(<MutedUsersList />);
    const unmuteButton = screen.getByText('Unmute');
    fireEvent.click(unmuteButton);

    expect(mockUnmuteUser).toHaveBeenCalledWith('user-123');
  });

  it('calls clearMutedUsers when clicking unmute all', async () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-1', 'user-2'],
      removeMutedUser: mockRemoveMutedUser,
      clearMutedUsers: mockClearMutedUsers,
    });
    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [
        {
          id: 'user-1',
          name: undefined,
          avatarUrl: undefined,
        },
        {
          id: 'user-2',
          name: undefined,
          avatarUrl: undefined,
        },
      ],
      isLoading: false,
    });

    render(<MutedUsersList />);
    const unmuteAllButton = screen.getByText('Unmute all users');
    fireEvent.click(unmuteAllButton);

    await waitFor(() => {
      expect(mockUnmuteUser).toHaveBeenCalledTimes(2);
    });
    expect(mockUnmuteUser).toHaveBeenCalledWith('user-1', { silent: true });
    expect(mockUnmuteUser).toHaveBeenCalledWith('user-2', { silent: true });
    expect(mockToast).toHaveBeenCalledWith({
      title: 'All users unmuted',
      description: "You'll see posts from all users again",
    });
  });
});

describe('MutedUsersList - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot - empty state', () => {
    mockUseSettingsStore.mockReturnValue({
      muted: [],
      removeMutedUser: mockRemoveMutedUser,
      clearMutedUsers: mockClearMutedUsers,
    });
    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [],
      isLoading: false,
    });

    const { container } = render(<MutedUsersList />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot - with muted users', () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-1', 'user-2', 'user-3'],
      removeMutedUser: mockRemoveMutedUser,
      clearMutedUsers: mockClearMutedUsers,
    });
    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [
        {
          id: 'user-1',
          name: undefined,
          avatarUrl: undefined,
        },
        {
          id: 'user-2',
          name: undefined,
          avatarUrl: undefined,
        },
        {
          id: 'user-3',
          name: undefined,
          avatarUrl: undefined,
        },
      ],
      isLoading: false,
    });

    const { container } = render(<MutedUsersList />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
