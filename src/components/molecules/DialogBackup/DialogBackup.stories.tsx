import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DialogBackup } from './DialogBackup';

const meta = {
  title: 'Molecules/DialogBackup',
  component: DialogBackup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    onOpenChange: { action: 'openChange' },
  },
} satisfies Meta<typeof DialogBackup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Controlled: Story = {
  args: {
    open: true,
    onOpenChange: (open: boolean) => console.log('Open changed:', open),
  },
};
