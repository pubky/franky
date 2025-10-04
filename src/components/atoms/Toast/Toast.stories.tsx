import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './Toast';
import { Button } from '@/components/atoms/Button';

const meta: Meta<typeof Toast> = {
  title: 'Atoms/Toast',
  component: Toast,
  subcomponents: {
    ToastProvider,
    ToastViewport,
    ToastTitle,
    ToastDescription,
    ToastAction,
    ToastClose,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Toast components built on Sonner for displaying temporary notifications. Includes ToastProvider, ToastViewport, and individual toast elements.',
      },
    },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'The content inside the toast',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: 'This is a default toast message',
  },
  render: (args) => (
    <ToastProvider>
      <Toast {...args} />
    </ToastProvider>
  ),
};

export const WithTitle: Story = {
  args: {
    children: (
      <>
        <ToastTitle>Success!</ToastTitle>
        <ToastDescription>Your changes have been saved.</ToastDescription>
      </>
    ),
  },
  render: (args) => (
    <ToastProvider>
      <Toast {...args} />
    </ToastProvider>
  ),
};

export const WithAction: Story = {
  args: {
    children: (
      <>
        <ToastTitle>File uploaded</ToastTitle>
        <ToastDescription>Your file has been successfully uploaded.</ToastDescription>
        <ToastAction>
          <Button variant="outline" size="sm">
            View
          </Button>
        </ToastAction>
      </>
    ),
  },
  render: (args) => (
    <ToastProvider>
      <Toast {...args} />
    </ToastProvider>
  ),
};

export const WithClose: Story = {
  args: {
    children: (
      <>
        <ToastTitle>Notification</ToastTitle>
        <ToastDescription>This is a dismissible notification.</ToastDescription>
        <ToastClose>
          <Button variant="ghost" size="sm">
            ×
          </Button>
        </ToastClose>
      </>
    ),
  },
  render: (args) => (
    <ToastProvider>
      <Toast {...args} />
    </ToastProvider>
  ),
};

export const ErrorVariant: Story = {
  args: {
    children: (
      <>
        <ToastTitle>Error</ToastTitle>
        <ToastDescription>Something went wrong. Please try again.</ToastDescription>
      </>
    ),
  },
  render: (args) => (
    <ToastProvider>
      <Toast {...args} />
    </ToastProvider>
  ),
};

export const WarningVariant: Story = {
  args: {
    children: (
      <>
        <ToastTitle>Warning</ToastTitle>
        <ToastDescription>Please review your input before continuing.</ToastDescription>
      </>
    ),
  },
  render: (args) => (
    <ToastProvider>
      <Toast {...args} />
    </ToastProvider>
  ),
};

export const ComplexToast: Story = {
  args: {
    children: (
      <>
        <ToastTitle>Complex Notification</ToastTitle>
        <ToastDescription>This is a more complex toast with multiple elements and actions.</ToastDescription>
        <div className="flex gap-2 mt-2">
          <ToastAction>
            <Button variant="outline" size="sm">
              Accept
            </Button>
          </ToastAction>
          <ToastClose>
            <Button variant="ghost" size="sm">
              Dismiss
            </Button>
          </ToastClose>
        </div>
      </>
    ),
  },
  render: (args) => (
    <ToastProvider>
      <Toast {...args} />
    </ToastProvider>
  ),
};

export const ToastViewportOnly: Story = {
  render: () => (
    <ToastProvider>
      <ToastViewport />
      <div className="text-center">
        <p>Toast viewport is rendered but no toasts are shown.</p>
        <p>Use the interactive examples above to see toasts in action.</p>
      </div>
    </ToastProvider>
  ),
};
