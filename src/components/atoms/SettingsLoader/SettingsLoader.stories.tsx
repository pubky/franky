import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SettingsLoader } from './SettingsLoader';

const meta = {
  title: 'Atoms/SettingsLoader',
  component: SettingsLoader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SettingsLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'w-full max-w-2xl',
  },
};
