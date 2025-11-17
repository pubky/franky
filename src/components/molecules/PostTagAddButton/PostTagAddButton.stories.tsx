import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PostTagAddButton } from './PostTagAddButton';

const meta: Meta<typeof PostTagAddButton> = {
  title: 'Molecules/Post/PostTagAddButton',
  component: PostTagAddButton,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#05050A' },
        { name: 'light', value: '#F2F2F7' },
      ],
    },
    docs: {
      description: {
        component: 'Simple button with a plus icon to trigger adding a new tag. Features a dashed border.',
      },
    },
  },
  argTypes: {
    onClick: { action: 'clicked' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <PostTagAddButton {...args} />,
};

export const Default: Story = {
  render: (args) => <PostTagAddButton {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Default add tag button with plus icon.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    onClick: () => console.log('Add tag clicked'),
  },
  render: (args) => <PostTagAddButton {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Click the button to see the console log.',
      },
    },
  },
};

// With other tags
export const WithTags: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="flex h-8 items-center gap-1.5 rounded-lg px-3 backdrop-blur-lg"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(5, 5, 10, 0.7) 0%, rgba(5, 5, 10, 0.7) 100%), linear-gradient(90deg, rgb(255, 153, 0) 0%, rgb(255, 153, 0) 100%)',
        }}
      >
        <span className="text-sm leading-5 font-bold text-white">bitcoin</span>
        <span className="text-sm leading-5 font-medium text-white opacity-50">21</span>
      </div>
      <div
        className="flex h-8 items-center gap-1.5 rounded-lg px-3 backdrop-blur-lg"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(5, 5, 10, 0.7) 0%, rgba(5, 5, 10, 0.7) 100%), linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(255, 0, 0) 100%)',
        }}
      >
        <span className="text-sm leading-5 font-bold text-white">based</span>
        <span className="text-sm leading-5 font-medium text-white opacity-50">7</span>
      </div>
      <PostTagAddButton {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Add button shown alongside existing tags.',
      },
    },
  },
};
