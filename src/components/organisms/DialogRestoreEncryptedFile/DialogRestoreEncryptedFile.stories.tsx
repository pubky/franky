import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DialogRestoreEncryptedFile } from './DialogRestoreEncryptedFile';

const meta = {
  title: 'Organisms/DialogRestoreEncryptedFile',
  component: DialogRestoreEncryptedFile,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A dialog component that allows users to restore their account using an encrypted backup file. Users can upload a .pkarr file and enter their password to restore their account.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onRestore: { action: 'restored' },
  },
} satisfies Meta<typeof DialogRestoreEncryptedFile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onRestore: () => console.log('Account restored successfully'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default state of the DialogRestoreEncryptedFile component. Click the trigger button to open the dialog.',
      },
    },
  },
};
