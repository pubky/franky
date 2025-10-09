import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { FilterTimeframe, type TimeframeTab } from './FilterTimeframe';

const meta: Meta<typeof FilterTimeframe> = {
  title: 'Templates/Hot/FilterTimeframe',
  component: FilterTimeframe,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Timeframe filter component for the Hot page to filter content by time period.',
      },
    },
  },
  args: {
    selectedTab: 'today',
  },
  argTypes: {
    selectedTab: {
      control: 'inline-radio',
      options: ['today', 'thisMonth', 'allTime'],
    },
    onTabChange: { action: 'tab changed' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <FilterTimeframe {...args} />,
};

export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = useState<TimeframeTab>('today');

    return <FilterTimeframe selectedTab={selected} onTabChange={setSelected} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example showing the component controlling its own selected timeframe state.',
      },
    },
  },
};

export const ThisMonthSelected: Story = {
  args: {
    selectedTab: 'thisMonth',
  },
};

export const AllTimeSelected: Story = {
  args: {
    selectedTab: 'allTime',
  },
};
