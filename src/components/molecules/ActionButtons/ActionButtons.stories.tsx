import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ActionButtons } from './ActionButtons';

const meta: Meta<typeof ActionButtons> = {
  title: 'Molecules/Buttons/ActionButtons',
  component: ActionButtons,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Authentication call-to-action buttons featuring sign in and account creation.',
      },
    },
  },
  args: {
    signInText: 'Sign in',
    createAccountText: 'Create account',
  },
  argTypes: {
    onSignIn: { action: 'sign in clicked' },
    onCreateAccount: { action: 'create account clicked' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <ActionButtons {...args} />,
};

export const CustomLabels: Story = {
  args: {
    signInText: 'Log in',
    createAccountText: 'Register',
  },
};

export const CompactLayout: Story = {
  args: {
    className: 'w-full flex-col sm:flex-row gap-2',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates applying a custom class to adjust layout responsiveness.',
      },
    },
  },
};
