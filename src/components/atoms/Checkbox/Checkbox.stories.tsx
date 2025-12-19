import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { Checkbox } from './Checkbox';

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: { type: 'boolean' },
      description: 'Whether the checkbox is checked',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the checkbox is disabled',
    },
    label: {
      control: { type: 'text' },
      description: 'Label text displayed next to the checkbox',
    },
    description: {
      control: { type: 'text' },
      description: 'Description text displayed below the label',
    },
  },
  args: { onCheckedChange: fn() },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic states
export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Unchecked: Story = {
  args: {
    checked: false,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
  },
};

// With label
export const WithLabel: Story = {
  args: {
    label: 'Checkbox Text',
  },
};

export const WithLabelChecked: Story = {
  args: {
    label: 'Checkbox Text',
    checked: true,
  },
};

export const WithLabelDisabled: Story = {
  args: {
    label: 'Checkbox Text',
    disabled: true,
  },
};

export const WithLabelDisabledChecked: Story = {
  args: {
    label: 'Checkbox Text',
    disabled: true,
    checked: true,
  },
};

// With label and description
export const WithLabelAndDescription: Story = {
  args: {
    label: 'Checkbox Text',
    description: 'This is a checkbox description.',
  },
};

export const WithLabelAndDescriptionChecked: Story = {
  args: {
    label: 'Checkbox Text',
    description: 'This is a checkbox description.',
    checked: true,
  },
};

export const WithLabelAndDescriptionDisabled: Story = {
  args: {
    label: 'Checkbox Text',
    description: 'This is a checkbox description.',
    disabled: true,
  },
};

export const WithLabelAndDescriptionDisabledChecked: Story = {
  args: {
    label: 'Checkbox Text',
    description: 'This is a checkbox description.',
    disabled: true,
    checked: true,
  },
};

// Real-world examples
export const AcceptTerms: Story = {
  args: {
    label: 'I accept the terms and conditions',
    description: 'By checking this box, you agree to our Terms of Service and Privacy Policy.',
  },
};

export const DontShowAgain: Story = {
  args: {
    label: "Don't show this again",
  },
};

export const RememberMe: Story = {
  args: {
    label: 'Remember me',
    description: 'Keep me signed in on this device.',
  },
};

export const SubscribeNewsletter: Story = {
  args: {
    label: 'Subscribe to newsletter',
    description: 'Receive updates about new features and announcements.',
    checked: true,
  },
};
