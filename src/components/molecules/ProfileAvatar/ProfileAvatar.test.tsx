import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileAvatar } from './ProfileAvatar';

describe('ProfileAvatar', () => {
  const defaultProps = {
    name: 'John Doe',
    handle: '@johndoe',
  };

  it('renders user name and handle', () => {
    render(<ProfileAvatar {...defaultProps} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
  });

  it('shows edit profile button for own profile', () => {
    const onEditProfile = vi.fn();
    render(<ProfileAvatar {...defaultProps} isOwnProfile onEditProfile={onEditProfile} />);
    const editButton = screen.getByText('Edit Profile');
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);
    expect(onEditProfile).toHaveBeenCalled();
  });

  it('shows follow button for other profiles', () => {
    const onFollowToggle = vi.fn();
    render(<ProfileAvatar {...defaultProps} isOwnProfile={false} onFollowToggle={onFollowToggle} />);
    const followButton = screen.getByText('Follow');
    expect(followButton).toBeInTheDocument();
    fireEvent.click(followButton);
    expect(onFollowToggle).toHaveBeenCalled();
  });

  it('shows unfollow button when already following', () => {
    const onFollowToggle = vi.fn();
    render(
      <ProfileAvatar {...defaultProps} isOwnProfile={false} onFollowToggle={onFollowToggle} isFollowing={true} />,
    );
    const unfollowButton = screen.getByText('Unfollow');
    expect(unfollowButton).toBeInTheDocument();
  });
});

