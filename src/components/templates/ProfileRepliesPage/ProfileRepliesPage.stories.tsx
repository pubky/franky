import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProfileRepliesPage } from './ProfileRepliesPage';

const meta: Meta<typeof ProfileRepliesPage> = {
  title: 'Templates/ProfileRepliesPage',
  component: ProfileRepliesPage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
