import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Toaster } from './Toaster';
import { Button } from '@/components/atoms/Button';
import { useToast } from './use-toast';

const meta: Meta<typeof Toaster> = {
  title: 'Molecules/Toaster',
  component: Toaster,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Toaster component provides a centralized toast notification system. It renders a ToastViewport that displays toast notifications at the bottom-center of the screen with proper theming and styling.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveExample = () => {
  const { toast } = useToast();

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Interactive Toaster</h2>
      <p className="text-muted-foreground">Click the buttons below to see different types of toast notifications.</p>
      <div className="grid grid-cols-1 gap-2">
        <Button
          onClick={() =>
            toast({
              title: 'Success!',
              description: 'Your action was completed successfully.',
            })
          }
        >
          Show Success Toast
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            toast({
              title: 'Error!',
              description: 'Something went wrong. Please try again.',
              variant: 'error',
            })
          }
        >
          Show Error Toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: 'Warning!',
              description: 'Please review your input before continuing.',
              variant: 'warning',
            })
          }
        >
          Show Warning Toast
        </Button>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-8">
      <InteractiveExample />
      <Toaster />
    </div>
  ),
};

export const WithBackground: Story = {
  render: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Toaster with Background</h2>
        <p className="text-gray-700">The toaster works with different background colors and themes.</p>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-4">This is a content area where toasts would appear above.</p>
          <InteractiveExample />
        </div>
      </div>
      <Toaster />
    </div>
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold">Toaster in Dark Theme</h2>
        <p className="text-gray-300">The toaster adapts to dark themes automatically.</p>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-400 mb-4">
            Toast notifications will appear with appropriate dark theme styling.
          </p>
          <InteractiveExample />
        </div>
      </div>
      <Toaster />
    </div>
  ),
};

const ToastWithActionsExample = () => {
  const { toast } = useToast();

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h3 className="text-lg font-semibold">Toast with Actions</h3>
      <div className="grid grid-cols-1 gap-2">
        <Button
          onClick={() =>
            toast({
              title: 'File uploaded',
              description: 'Your file has been successfully uploaded.',
              action: {
                label: 'View',
                onClick: () => console.log('View file'),
              },
            })
          }
        >
          Upload File
        </Button>
        <Button
          onClick={() =>
            toast({
              title: 'Changes saved',
              description: 'Your changes have been saved to the database.',
              action: {
                label: 'Undo',
                onClick: () => console.log('Undo changes'),
              },
            })
          }
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export const WithActions: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-8">
      <ToastWithActionsExample />
      <Toaster />
    </div>
  ),
};

const MultipleToastsExample = () => {
  const { toast } = useToast();

  const showMultipleToasts = () => {
    toast({
      title: 'First Toast',
      description: 'This is the first notification.',
    });

    setTimeout(() => {
      toast({
        title: 'Second Toast',
        description: 'This is the second notification.',
        variant: 'warning',
      });
    }, 500);

    setTimeout(() => {
      toast({
        title: 'Third Toast',
        description: 'This is the third notification.',
        variant: 'error',
      });
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h3 className="text-lg font-semibold">Multiple Toasts</h3>
      <p className="text-sm text-muted-foreground">
        Click the button below to show multiple toasts with different variants.
      </p>
      <Button onClick={showMultipleToasts}>Show Multiple Toasts</Button>
    </div>
  );
};

export const MultipleToasts: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-8">
      <MultipleToastsExample />
      <Toaster />
    </div>
  ),
};

const DismissibleToastExample = () => {
  const { toast } = useToast();

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h3 className="text-lg font-semibold">Dismissible Toast</h3>
      <p className="text-sm text-muted-foreground">
        This toast includes an &quot;OK&quot; button that dismisses the toast when clicked.
      </p>
      <div className="grid grid-cols-1 gap-2">
        <Button
          onClick={() =>
            toast({
              title: 'Information',
              description: 'This is an important message that requires acknowledgment.',
              action: {
                label: 'OK',
                onClick: () => {
                  // The toast will be dismissed automatically when the action is clicked
                  console.log('Toast dismissed');
                },
              },
            })
          }
        >
          Show Dismissible Toast
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            toast({
              title: 'Error Occurred',
              description: 'Something went wrong. Please review and try again.',
              action: {
                label: 'Dismiss',
                onClick: () => {
                  console.log('Error toast dismissed');
                },
              },
            })
          }
        >
          Show Error with Dismiss
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: 'Warning',
              description: 'Please review your settings before continuing.',
              action: {
                label: 'Got it',
                onClick: () => {
                  console.log('Warning acknowledged');
                },
              },
            })
          }
        >
          Show Warning with Acknowledge
        </Button>
      </div>
    </div>
  );
};

export const DismissibleToast: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-8">
      <DismissibleToastExample />
      <Toaster />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates toasts with dismissible action buttons, similar to real app notifications.',
      },
    },
  },
};

const RealWorldToastExample = () => {
  const { toast } = useToast();

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h3 className="text-lg font-semibold">Real-World Toast Examples</h3>
      <p className="text-sm text-muted-foreground">
        Examples of toasts you might see in a real application with proper dismiss buttons.
      </p>
      <div className="grid grid-cols-1 gap-2">
        <Button
          onClick={() =>
            toast({
              title: 'Settings Saved',
              description: 'Your preferences have been updated successfully.',
              action: {
                label: 'OK',
                onClick: () => {
                  console.log('Settings toast acknowledged');
                },
              },
            })
          }
        >
          Settings Saved Toast
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            toast({
              title: 'Connection Lost',
              description: 'Unable to connect to the server. Please check your internet connection.',
              action: {
                label: 'Retry',
                onClick: () => {
                  console.log('Retrying connection...');
                  // In a real app, this would trigger a reconnection attempt
                },
              },
            })
          }
        >
          Connection Error Toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: 'New Message',
              description: 'You have received a new message from John Doe.',
              action: {
                label: 'View',
                onClick: () => {
                  console.log('Opening message...');
                  // In a real app, this would navigate to the message
                },
              },
            })
          }
        >
          New Message Toast
        </Button>
        <Button
          onClick={() =>
            toast({
              title: 'File Upload Complete',
              description: 'Your file has been uploaded and is ready for processing.',
              action: {
                label: 'View File',
                onClick: () => {
                  console.log('Opening uploaded file...');
                },
              },
            })
          }
        >
          File Upload Toast
        </Button>
      </div>
    </div>
  );
};

export const RealWorldExamples: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-8">
      <RealWorldToastExample />
      <Toaster />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Real-world examples of toasts with dismissible action buttons, similar to what users see in production applications.',
      },
    },
  },
};
