import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AlertBackup } from './AlertBackup';

const meta = {
  title: 'Molecules/AlertBackup',
  component: AlertBackup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onDismiss: { action: 'dismissed' },
  },
} satisfies Meta<typeof AlertBackup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithDismissHandler: Story = {
  args: {
    onDismiss: () => console.log('Dismissed'),
  },
};
