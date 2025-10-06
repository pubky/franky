import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DialogRestoreRecoveryPhrase } from './DialogRestoreRecoveryPhrase';

const meta = {
  title: 'Organisms/DialogRestoreRecoveryPhrase',
  component: DialogRestoreRecoveryPhrase,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A dialog component that allows users to restore their account using a 12-word recovery phrase. Users can enter each word individually with validation, and the component handles the restoration process.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onRestore: { action: 'restored' },
  },
} satisfies Meta<typeof DialogRestoreRecoveryPhrase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onRestore: () => console.log('Account restored with recovery phrase'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default state of the DialogRestoreRecoveryPhrase component. Click the trigger button to open the dialog and enter the 12-word recovery phrase.',
      },
    },
  },
};
