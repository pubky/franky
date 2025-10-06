import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DialogBackupEncrypted } from './DialogBackupEncrypted';

const meta = {
  title: 'Organisms/DialogBackupEncrypted',
  component: DialogBackupEncrypted,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A multi-step dialog component that allows users to create an encrypted backup file of their account. Users can set a password, download the encrypted file, and complete the backup process.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: false,
      description: 'Optional trigger element. If not provided, a default button will be used.',
    },
  },
} satisfies Meta<typeof DialogBackupEncrypted>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default state of the DialogBackupEncrypted component with a default trigger button.',
      },
    },
  },
};

export const WithButtonTrigger: Story = {
  args: {
    children: (
      <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Encrypted File
      </button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'DialogBackupEncrypted with a styled button trigger that includes an icon.',
      },
    },
  },
};
