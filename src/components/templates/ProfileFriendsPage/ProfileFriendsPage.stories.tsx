import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProfileFriendsPage } from './ProfileFriendsPage';

const meta: Meta<typeof ProfileFriendsPage> = {
  title: 'Templates/ProfileFriendsPage',
  component: ProfileFriendsPage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
