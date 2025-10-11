import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProfileTaggedPage } from './ProfileTaggedPage';

const meta: Meta<typeof ProfileTaggedPage> = {
  title: 'Templates/ProfileTaggedPage',
  component: ProfileTaggedPage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
