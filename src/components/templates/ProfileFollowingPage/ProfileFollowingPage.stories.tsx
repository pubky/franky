import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProfileFollowingPage } from './ProfileFollowingPage';

const meta: Meta<typeof ProfileFollowingPage> = {
  title: 'Templates/ProfileFollowingPage',
  component: ProfileFollowingPage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
