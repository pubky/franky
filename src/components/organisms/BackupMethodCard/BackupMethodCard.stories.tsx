import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BackupMethodCard } from './BackupMethodCard';

const meta = {
  title: 'Organisms/BackupMethodCard',
  component: BackupMethodCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A card component that allows users to choose their preferred backup method for their pubky. Displays three options: recovery phrase, encrypted file, and export to Pubky Ring. The export button text changes based on whether a mnemonic is available in the onboarding store.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BackupMethodCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default state of the BackupMethodCard component. The component will use the current state of the onboarding store to determine the export button text.',
      },
    },
  },
};
