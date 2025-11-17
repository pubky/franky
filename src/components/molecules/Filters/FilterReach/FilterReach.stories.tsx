import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { FilterReach } from './FilterReach';
import * as Core from '@/core';

const meta: Meta<typeof FilterReach> = {
  title: 'Molecules/Filter/FilterReach',
  component: FilterReach,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Reach filter preset that lets users refine results by relationship or visibility.

## Features

- **Controlled/Uncontrolled State**: Supports both controlled (via \`selectedTab\`) and uncontrolled (via \`defaultSelectedTab\`) patterns
- **Full Keyboard Navigation**: Arrow keys, Home/End, Space/Enter for selection
- **Accessibility**: Complete ARIA attributes with radiogroup/radio roles
- **Performance**: Memoized handlers and tabs array prevent unnecessary re-renders

## Accessibility

The component implements WAI-ARIA radiogroup pattern:
- \`role="radiogroup"\` on the list container
- \`role="radio"\` on each item
- \`aria-checked\` indicates selected state
- \`aria-labelledby\` links the radiogroup to its header
- \`tabIndex\` management for keyboard navigation (0 for selected, -1 for others)

## Keyboard Navigation

- **Arrow Up/Down** or **Arrow Left/Right**: Navigate between options
- **Space** or **Enter**: Select the focused option
- **Home**: Jump to first option
- **End**: Jump to last option
        `,
      },
    },
  },
  args: {
    selectedTab: 'all',
  },
  argTypes: {
    selectedTab: {
      control: 'inline-radio',
      options: ['all', 'following', 'friends', 'me'],
      description: 'Controlled selected tab value',
    },
    defaultSelectedTab: {
      control: 'inline-radio',
      options: ['all', 'following', 'friends', 'me'],
      description: 'Default selected tab for uncontrolled mode',
    },
    onTabChange: {
      action: 'tab changed',
      description: 'Callback fired when selection changes',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <FilterReach {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground to explore all component props. Try changing the selected tab or clicking on options.',
      },
    },
  },
};

const ControlledComponent = () => {
  const [selected, setSelected] = useState<Core.ReachType>('all');

  return (
    <div className="space-y-4">
      <FilterReach selectedTab={selected} onTabChange={setSelected} />
      <p className="text-sm text-muted-foreground">
        Current selection: <strong>{selected}</strong>
      </p>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledComponent />,
  parameters: {
    docs: {
      description: {
        story:
          'Controlled component example where the parent manages state via `selectedTab` prop. The selection state is displayed below.',
      },
    },
  },
};

export const Uncontrolled: Story = {
  render: () => {
    return (
      <div className="space-y-4">
        <FilterReach defaultSelectedTab="friends" onTabChange={(tab) => console.log('Tab changed to:', tab)} />
        <p className="text-sm text-muted-foreground">
          This component manages its own state. Check the console for change events.
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uncontrolled component example using `defaultSelectedTab` prop. The component manages its own internal state.',
      },
    },
  },
};

const KeyboardNavigationDemoComponent = () => {
  const [selected, setSelected] = useState<Core.ReachType>('all');
  const [lastAction, setLastAction] = useState<string>('None');

  return (
    <div className="space-y-4">
      <FilterReach
        selectedTab={selected}
        onTabChange={(tab) => {
          setSelected(tab);
          setLastAction(`Selected: ${tab}`);
        }}
      />
      <div className="space-y-2 text-sm">
        <p className="text-muted-foreground">
          <strong>Try keyboard navigation:</strong>
        </p>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>Tab to focus, then use Arrow keys to navigate</li>
          <li>Press Space or Enter to select</li>
          <li>Press Home/End to jump to first/last</li>
        </ul>
        <p className="text-foreground">
          Last action: <strong>{lastAction}</strong>
        </p>
      </div>
    </div>
  );
};

export const KeyboardNavigationDemo: Story = {
  render: () => <KeyboardNavigationDemoComponent />,
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo showcasing full keyboard navigation support. Focus on the component and use keyboard controls.',
      },
    },
  },
};

export const AllSelected: Story = {
  args: {
    selectedTab: 'all',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state with "All" reach selected.',
      },
    },
  },
};

export const FollowingSelected: Story = {
  args: {
    selectedTab: 'following',
  },
  parameters: {
    docs: {
      description: {
        story: 'Filter showing content from users you follow.',
      },
    },
  },
};

export const FriendsSelected: Story = {
  args: {
    selectedTab: 'friends',
  },
  parameters: {
    docs: {
      description: {
        story: 'Filter showing content from your friends (mutual follows).',
      },
    },
  },
};
