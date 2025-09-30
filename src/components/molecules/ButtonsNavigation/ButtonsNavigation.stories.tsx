import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ButtonsNavigation } from './ButtonsNavigation';

const meta: Meta<typeof ButtonsNavigation> = {
  title: 'Molecules/Buttons/ButtonsNavigation',
  component: ButtonsNavigation,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Two-button navigation control used in multi-step flows.',
      },
    },
  },
  args: {
    backText: 'Back',
    continueText: 'Continue',
    backButtonDisabled: false,
    continueButtonDisabled: false,
    hiddenContinueButton: false,
  },
  argTypes: {
    onHandleBackButton: { action: 'back clicked' },
    onHandleContinueButton: { action: 'continue clicked' },
    hiddenContinueButton: {
      control: 'boolean',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <ButtonsNavigation {...args} />,
};

export const WithDisabledState: Story = {
  args: {
    backButtonDisabled: true,
    continueButtonDisabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Both buttons disabled to illustrate disabled styling.',
      },
    },
  },
};

export const BackOnly: Story = {
  args: {
    hiddenContinueButton: true,
    backText: 'Return',
  },
  parameters: {
    docs: {
      description: {
        story: 'Scenario where only the back button is visible.',
      },
    },
  },
};

export const CustomLabels: Story = {
  args: {
    backText: 'Previous',
    continueText: 'Next Step',
  },
};
