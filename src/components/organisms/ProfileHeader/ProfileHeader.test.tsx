import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { ProfileHeader } from './ProfileHeader';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock the custom hooks
vi.mock('./useStatusManager', () => ({
  useStatusManager: vi.fn(() => ({
    currentStatus: 'Vacationing',
    customStatus: '',
    selectedEmoji: '😊',
    showStatusMenu: false,
    showEmojiPicker: false,
    setCurrentStatus: vi.fn(),
    setCustomStatus: vi.fn(),
    setSelectedEmoji: vi.fn(),
    setShowStatusMenu: vi.fn(),
    setShowEmojiPicker: vi.fn(),
    handleStatusSelect: vi.fn(),
    handleCustomStatusSave: vi.fn(),
    handleEmojiSelect: vi.fn(),
    handleStatusMenuChange: vi.fn(),
  })),
}));

vi.mock('./useCopyActions', () => ({
  useCopyActions: vi.fn(() => ({
    handleCopyPubky: vi.fn(),
    handleCopyLink: vi.fn(),
  })),
}));

vi.mock('./useEmojiPicker', () => ({
  useEmojiPicker: vi.fn(() => ({
    showEmojiPicker: false,
    emojiPickerRef: { current: null },
    openEmojiPicker: vi.fn(),
    closeEmojiPicker: vi.fn(),
    handleEmojiPickerClick: vi.fn(),
    handleEmojiPickerContentClick: vi.fn(),
  })),
}));

const mockPush = vi.fn();

describe('ProfileHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as vi.MockedFunction<typeof useRouter>).mockReturnValue({
      push: mockPush,
    });
  });

  const defaultProps = {
    name: 'John Doe',
    handle: 'johndoe123',
    bio: 'Software developer',
    avatar: 'https://example.com/avatar.jpg',
    isOwnProfile: true,
  };

  it('renders with default props', () => {
    render(<ProfileHeader {...defaultProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Software developer')).toBeInTheDocument();
    expect(screen.getByText('johndoe123')).toBeInTheDocument();
  });

  it('renders without bio when not provided', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bio, ...propsWithoutBio } = defaultProps;
    render(<ProfileHeader {...propsWithoutBio} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Software developer')).not.toBeInTheDocument();
  });

  it('shows own profile actions when isOwnProfile is true', () => {
    render(<ProfileHeader {...defaultProps} />);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('hides own profile actions when isOwnProfile is false', () => {
    render(<ProfileHeader {...defaultProps} isOwnProfile={false} />);

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });

  it('calls router.push when edit button is clicked', () => {
    render(<ProfileHeader {...defaultProps} />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockPush).toHaveBeenCalledWith('/edit-profile');
  });

  it('calls router.push when sign out button is clicked', () => {
    render(<ProfileHeader {...defaultProps} />);

    const signOutButton = screen.getByText('Sign out');
    fireEvent.click(signOutButton);

    expect(mockPush).toHaveBeenCalledWith('/home');
  });

  it('truncates long handles in copy button', () => {
    const longHandle = 'verylonghandle123456789';
    render(<ProfileHeader {...defaultProps} handle={longHandle} />);

    expect(screen.getByText('very...6789')).toBeInTheDocument();
  });

  it('shows full handle for short handles', () => {
    const shortHandle = 'short';
    render(<ProfileHeader {...defaultProps} handle={shortHandle} />);

    expect(screen.getByText('short')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-class';
    const { container } = render(<ProfileHeader {...defaultProps} className={customClass} />);

    expect(container.firstChild).toHaveClass(customClass);
  });
});
