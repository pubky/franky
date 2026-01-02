import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MutedUsersList } from './MutedUsersList';

const { mockUseSettingsStore, mockUnmuteUser, mockIsUserLoading, mockUseMuteUser, mockUseMutedUsers, mockToast } =
  vi.hoisted(() => ({
    mockUseSettingsStore: vi.fn(),
    mockUnmuteUser: vi.fn().mockResolvedValue(undefined),
    mockIsUserLoading: vi.fn().mockReturnValue(false),
    mockUseMuteUser: vi.fn(),
    mockUseMutedUsers: vi.fn(),
    mockToast: vi.fn(),
  }));

vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    useSettingsStore: () => mockUseSettingsStore(),
  };
});

vi.mock('@/hooks', () => ({
  useMuteUser: () => mockUseMuteUser(),
  useMutedUsers: () => mockUseMutedUsers(),
}));

vi.mock('@/molecules', () => ({
  toast: mockToast,
  SettingsDivider: ({ className }: { className?: string }) => <div className={className} />,
}));

describe('MutedUsersList', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseMuteUser.mockReturnValue({
      unmuteUser: mockUnmuteUser,
      isLoading: false,
      isUserLoading: mockIsUserLoading,
    });

    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [],
      isLoading: false,
    });

    mockUseSettingsStore.mockReturnValue({
      muted: [],
    });
  });

  it('renders empty state when no muted users', () => {
    render(<MutedUsersList />);
    expect(screen.getByText('No muted users yet')).toBeInTheDocument();
  });

  it('renders muted user with unmute button', () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-123'],
    });

    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [{ id: 'user-123', name: undefined, avatarUrl: undefined }],
      isLoading: false,
    });

    render(<MutedUsersList />);
    expect(screen.getByText('Unknown User')).toBeInTheDocument();
    expect(screen.getByText('user-123')).toBeInTheDocument();
    expect(screen.getByText('Unmute')).toBeInTheDocument();
  });

  it('renders muted user with name and avatar', () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-123'],
    });

    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [{ id: 'user-123', name: 'John Doe', avatarUrl: 'https://example.com/avatar.png' }],
      isLoading: false,
    });

    render(<MutedUsersList />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('user-123')).toBeInTheDocument();
  });

  it('calls unmuteUser when clicking unmute', async () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-123'],
    });

    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [{ id: 'user-123', name: 'Test User', avatarUrl: undefined }],
      isLoading: false,
    });

    render(<MutedUsersList />);
    const unmuteButton = screen.getByText('Unmute');
    fireEvent.click(unmuteButton);

    await waitFor(() => {
      expect(mockUnmuteUser).toHaveBeenCalledWith('user-123');
    });
  });

  it('calls unmuteUser without silent option for single unmute', async () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-123'],
    });

    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [{ id: 'user-123', name: 'Test User', avatarUrl: undefined }],
      isLoading: false,
    });

    render(<MutedUsersList />);
    const unmuteButton = screen.getByText('Unmute');
    fireEvent.click(unmuteButton);

    await waitFor(() => {
      expect(mockUnmuteUser).toHaveBeenCalledWith('user-123');
    });
  });

  it('shows "Unmute all users" button when more than one muted user', () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-1', 'user-2'],
    });

    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [
        { id: 'user-1', name: 'User 1', avatarUrl: undefined },
        { id: 'user-2', name: 'User 2', avatarUrl: undefined },
      ],
      isLoading: false,
    });

    render(<MutedUsersList />);
    expect(screen.getByText('Unmute all users')).toBeInTheDocument();
  });

  it('does not show "Unmute all users" button when only one muted user', () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-1'],
    });

    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [{ id: 'user-1', name: 'User 1', avatarUrl: undefined }],
      isLoading: false,
    });

    render(<MutedUsersList />);
    expect(screen.queryByText('Unmute all users')).not.toBeInTheDocument();
  });

  it('calls unmuteUser for each user when clicking unmute all (silent mode)', async () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-1', 'user-2'],
    });

    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [
        { id: 'user-1', name: 'User 1', avatarUrl: undefined },
        { id: 'user-2', name: 'User 2', avatarUrl: undefined },
      ],
      isLoading: false,
    });

    render(<MutedUsersList />);
    const unmuteAllButton = screen.getByText('Unmute all users');
    fireEvent.click(unmuteAllButton);

    await waitFor(() => {
      expect(mockUnmuteUser).toHaveBeenCalledWith('user-1', { silent: true });
      expect(mockUnmuteUser).toHaveBeenCalledWith('user-2', { silent: true });
    });
  });

  it('renders multiple muted users', () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-1', 'user-2', 'user-3'],
    });

    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [
        { id: 'user-1', name: 'User 1', avatarUrl: undefined },
        { id: 'user-2', name: 'User 2', avatarUrl: undefined },
        { id: 'user-3', name: 'User 3', avatarUrl: undefined },
      ],
      isLoading: false,
    });

    render(<MutedUsersList />);
    expect(screen.getByText('user-1')).toBeInTheDocument();
    expect(screen.getByText('user-2')).toBeInTheDocument();
    expect(screen.getByText('user-3')).toBeInTheDocument();
  });

  it('shows loading state when loading', () => {
    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [],
      isLoading: true,
    });

    render(<MutedUsersList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows spinner on unmute button when unmuting specific user', () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-123'],
    });

    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [{ id: 'user-123', name: 'Test User', avatarUrl: undefined }],
      isLoading: false,
    });

    mockIsUserLoading.mockReturnValue(true);

    render(<MutedUsersList />);
    const button = screen.getByRole('button', { name: /unmute/i });
    expect(button).toBeDisabled();
  });
});

describe('MutedUsersList - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseMuteUser.mockReturnValue({
      unmuteUser: mockUnmuteUser,
      isLoading: false,
      isUserLoading: mockIsUserLoading,
    });

    mockUseSettingsStore.mockReturnValue({
      muted: [],
    });
  });

  it('matches snapshot - empty state', () => {
    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [],
      isLoading: false,
    });

    const { container } = render(<MutedUsersList />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot - with muted users', () => {
    mockUseSettingsStore.mockReturnValue({
      muted: ['user-1', 'user-2'],
    });

    mockUseMutedUsers.mockReturnValue({
      mutedUsers: [
        { id: 'user-1', name: 'User One', avatarUrl: undefined },
        { id: 'user-2', name: 'User Two', avatarUrl: undefined },
      ],
      isLoading: false,
    });

    const { container } = render(<MutedUsersList />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
