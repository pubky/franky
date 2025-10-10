import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProfileNotificationsPage } from './ProfileNotificationsPage';

const meta: Meta<typeof ProfileNotificationsPage> = {
  title: 'Templates/ProfileNotificationsPage',
  component: ProfileNotificationsPage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
