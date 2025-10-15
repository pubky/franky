import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { DialogDeleteAccount } from '@/molecules';

const meta = {
  title: 'Molecules/DialogDeleteAccount',
  component: DialogDeleteAccount,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
    onOpenChangeAction: { action: 'openChange' },
    onDeleteAccount: { action: 'deleteAccount' },
  },
  args: {
    isOpen: true,
  },
} satisfies Meta<typeof DialogDeleteAccount>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to handle state properly in Storybook
const DialogWrapper = ({
  initialOpen = true,
  onDeleteAccount,
}: {
  initialOpen?: boolean;
  onDeleteAccount?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return <DialogDeleteAccount isOpen={isOpen} onOpenChangeAction={setIsOpen} onDeleteAccount={onDeleteAccount} />;
};

export const Default: Story = {
  args: {
    isOpen: true,
    onOpenChangeAction: () => {},
    onDeleteAccount: () => {},
  },
  render: () => <DialogWrapper />,
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onOpenChangeAction: () => {},
    onDeleteAccount: () => {},
  },
  render: () => <DialogWrapper initialOpen={false} />,
};

export const WithDeleteHandler: Story = {
  args: {
    isOpen: true,
    onOpenChangeAction: () => {},
    onDeleteAccount: () => {},
  },
  render: () => (
    <DialogWrapper
      onDeleteAccount={() => {
        console.log('Account deletion confirmed');
        alert('Account deletion confirmed!');
      }}
    />
  ),
};
