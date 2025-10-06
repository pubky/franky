import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip';
import * as Atoms from '@/atoms';

const meta: Meta<typeof Tooltip> = {
  title: 'Atoms/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A tooltip component built with Radix UI. Displays informative text when users hover over or focus on an element.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="p-20">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Atoms.Button variant="secondary">Hover me</Atoms.Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithCustomText: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Atoms.Button variant="default">Settings</Atoms.Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Manage your account settings</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const OnIcon: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Atoms.Button variant="secondary" size="icon">
          <span className="text-2xl">⚙️</span>
        </Atoms.Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Settings</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithDelay: Story = {
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={1000}>
        <div className="p-20">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Atoms.Button variant="default">Hover for 1 second</Atoms.Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This tooltip appears after a delay</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const DifferentSides: Story = {
  render: () => (
    <div className="flex gap-8">
      <Tooltip>
        <TooltipTrigger asChild>
          <Atoms.Button variant="secondary">Top (default)</Atoms.Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tooltip on top</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Atoms.Button variant="secondary">Right</Atoms.Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Tooltip on right</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Atoms.Button variant="secondary">Bottom</Atoms.Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Tooltip on bottom</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Atoms.Button variant="secondary">Left</Atoms.Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip on left</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Atoms.Button variant="default">Custom styled tooltip</Atoms.Button>
      </TooltipTrigger>
      <TooltipContent className="bg-blue-600 text-white font-bold">
        <p>Custom background and text color</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Atoms.Button variant="secondary">Hover for more info</Atoms.Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>
          This is a longer tooltip with more detailed information. It can wrap to multiple lines and provide
          comprehensive context about the element.
        </p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const OnTextLink: Story = {
  render: () => (
    <div className="text-center">
      <p className="text-muted-foreground">
        Learn more about{' '}
        <Tooltip>
          <TooltipTrigger asChild>
            <Atoms.Link href="#" className="underline">
              tooltips
            </Atoms.Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to learn more</p>
          </TooltipContent>
        </Tooltip>
      </p>
    </div>
  ),
};

export const MultipleTooltips: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Atoms.Button variant="secondary" size="icon">
            🏠
          </Atoms.Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Home</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Atoms.Button variant="secondary" size="icon">
            🔥
          </Atoms.Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Hot</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Atoms.Button variant="secondary" size="icon">
            🔖
          </Atoms.Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Bookmarks</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Atoms.Button variant="secondary" size="icon">
            ⚙️
          </Atoms.Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Settings</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};
