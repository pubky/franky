import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MutedUsersList } from './MutedUsersList';

// Mock settings store
const mockRemoveMutedUser = vi.fn();
const mockClearMutedUsers = vi.fn();
const mockUseSettingsStore = vi.fn();

vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    useSettingsStore: () => mockUseSettingsStore(),
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

    render(<MutedUsersList />);
    expect(screen.getByText('No muted users yet')).toBeInTheDocument();
  });

  it('renders muted user with unmute button', () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-123'],
      removeMutedUser: mockRemoveMutedUser,
      clearMutedUsers: mockClearMutedUsers,
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

    render(<MutedUsersList />);
    const unmuteButton = screen.getByText('Unmute');
    fireEvent.click(unmuteButton);

    expect(mockRemoveMutedUser).toHaveBeenCalledWith('user-123');
  });

  it('calls clearMutedUsers when clicking unmute all', () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-1', 'user-2'],
      removeMutedUser: mockRemoveMutedUser,
      clearMutedUsers: mockClearMutedUsers,
    });

    render(<MutedUsersList />);
    const unmuteAllButton = screen.getByText('Unmute all users');
    fireEvent.click(unmuteAllButton);

    expect(mockClearMutedUsers).toHaveBeenCalled();
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

    const { container } = render(<MutedUsersList />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot - with muted users', () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-1', 'user-2', 'user-3'],
      removeMutedUser: mockRemoveMutedUser,
      clearMutedUsers: mockClearMutedUsers,
    });

    const { container } = render(<MutedUsersList />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
