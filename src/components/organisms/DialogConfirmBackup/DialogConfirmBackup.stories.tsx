import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DialogConfirmBackup } from './DialogConfirmBackup';

const meta = {
  title: 'Molecules/DialogConfirmBackup',
  component: DialogConfirmBackup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onConfirm: { action: 'confirmed' },
  },
} satisfies Meta<typeof DialogConfirmBackup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithConfirmHandler: Story = {
  args: {
    onConfirm: () => console.log('Backup confirmed'),
  },
};
