import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProfileFollowersPage } from './ProfileFollowersPage';

const meta: Meta<typeof ProfileFollowersPage> = {
  title: 'Templates/ProfileFollowersPage',
  component: ProfileFollowersPage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
