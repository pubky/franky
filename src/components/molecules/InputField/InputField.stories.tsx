import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { InputField } from '@/components/molecules/InputField';

const meta = {
  title: 'Molecules/InputField',
  component: InputField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'dashed'],
    },
    status: {
      control: { type: 'select' },
      options: ['default', 'success', 'error'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    iconPosition: {
      control: { type: 'select' },
      options: ['left', 'right'],
    },
    messageType: {
      control: { type: 'select' },
      options: ['default', 'info', 'alert', 'error', 'success'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
    readOnly: {
      control: { type: 'boolean' },
    },
  },
  args: {
    onChange: fn(),
    onClick: fn(),
    onClickIcon: fn(),
  },
} satisfies Meta<typeof InputField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '',
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Hello World',
    placeholder: 'Enter text...',
  },
};

export const WithIcon: Story = {
  args: {
    value: '',
    placeholder: 'Search...',
    icon: '🔍',
  },
};

export const WithRightIcon: Story = {
  args: {
    value: '',
    placeholder: 'Enter password...',
    icon: '👁️',
    iconPosition: 'right',
  },
};

export const Dashed: Story = {
  args: {
    value: '',
    placeholder: 'Dashed input...',
    variant: 'dashed',
  },
};

export const Success: Story = {
  args: {
    value: 'Valid input',
    placeholder: 'Enter text...',
    status: 'success',
    message: 'This looks good!',
    messageType: 'success',
  },
};

export const Error: Story = {
  args: {
    value: 'Invalid input',
    placeholder: 'Enter text...',
    status: 'error',
    message: 'This field is required',
    messageType: 'error',
  },
};

export const Loading: Story = {
  args: {
    value: '',
    placeholder: 'Loading...',
    loading: true,
    loadingText: 'Processing...',
  },
};

export const Disabled: Story = {
  args: {
    value: 'Disabled input',
    placeholder: 'Enter text...',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    value: 'Read only value',
    placeholder: 'Enter text...',
    readOnly: true,
  },
};

export const Small: Story = {
  args: {
    value: '',
    placeholder: 'Small input...',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    value: '',
    placeholder: 'Large input...',
    size: 'lg',
  },
};

export const WithMaxLength: Story = {
  args: {
    value: '',
    placeholder: 'Max 10 characters...',
    maxLength: 10,
    message: 'Maximum 10 characters allowed',
    messageType: 'info',
  },
};
