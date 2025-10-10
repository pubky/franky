import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProfilePostsPage } from './ProfilePostsPage';

const meta: Meta<typeof ProfilePostsPage> = {
  title: 'Templates/ProfilePostsPage',
  component: ProfilePostsPage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
