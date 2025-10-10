import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProfileHeader } from './ProfileHeader';

const meta: Meta<typeof ProfileHeader> = {
  title: 'Organisms/ProfileHeader',
  component: ProfileHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const OwnProfile: Story = {
  args: {
    name: 'John Doe',
    handle: '@johndoe',
    bio: 'Software engineer and open source enthusiast. Building the future of decentralized social networks.',
    isOwnProfile: true,
    onEditClick: () => alert('Edit clicked'),
    onLogoutClick: () => alert('Logout clicked'),
    onCopyPubkey: () => alert('Pubkey copied'),
    onCopyLink: () => alert('Link copied'),
    onAvatarClick: () => alert('Avatar clicked'),
  },
};

export const OtherUserProfile: Story = {
  args: {
    name: 'Jane Smith',
    handle: '@janesmith',
    bio: 'Designer & Creative Director. Passionate about UX/UI and digital art.',
    isOwnProfile: false,
    isFollowing: false,
    onFollowClick: () => alert('Follow clicked'),
    onCopyPubkey: () => alert('Pubkey copied'),
    onCopyLink: () => alert('Link copied'),
    onMenuClick: () => alert('Menu clicked'),
    onAvatarClick: () => alert('Avatar clicked'),
  },
};

export const FollowingUser: Story = {
  args: {
    name: 'Jane Smith',
    handle: '@janesmith',
    bio: 'Designer & Creative Director. Passionate about UX/UI and digital art.',
    isOwnProfile: false,
    isFollowing: true,
    onFollowClick: () => alert('Unfollow clicked'),
    onCopyPubkey: () => alert('Pubkey copied'),
    onCopyLink: () => alert('Link copied'),
    onMenuClick: () => alert('Menu clicked'),
    onAvatarClick: () => alert('Avatar clicked'),
  },
};

export const Loading: Story = {
  args: {
    name: 'Jane Smith',
    handle: '@janesmith',
    bio: 'Designer & Creative Director.',
    isOwnProfile: false,
    isFollowing: false,
    isLoadingFollow: true,
    onFollowClick: () => {},
    onCopyPubkey: () => alert('Pubkey copied'),
    onCopyLink: () => alert('Link copied'),
  },
};

export const WithoutBio: Story = {
  args: {
    name: 'John Doe',
    handle: '@johndoe',
    isOwnProfile: true,
    onEditClick: () => alert('Edit clicked'),
    onLogoutClick: () => alert('Logout clicked'),
    onCopyPubkey: () => alert('Pubkey copied'),
    onCopyLink: () => alert('Link copied'),
  },
};
