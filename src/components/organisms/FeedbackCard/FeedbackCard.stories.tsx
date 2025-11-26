import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FeedbackCard } from './FeedbackCard';

const meta: Meta<typeof FeedbackCard> = {
  title: 'Molecules/FeedbackCard',
  component: FeedbackCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A feedback card component that displays a user avatar and a feedback question, encouraging users to provide feedback about the application.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomClassName: Story = {
  args: {
    className: 'bg-gradient-to-br from-green-50 to-emerald-100',
  },
};

export const WithCustomStyling: Story = {
  args: {
    className: 'border border-primary/20 bg-primary/5',
  },
};
