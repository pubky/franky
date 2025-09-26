import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';

const meta = {
  title: 'Atoms/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the card content area where you can put any content.</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card with Action</CardTitle>
        <CardDescription>This card has an action button in the header</CardDescription>
        <CardAction>
          <Button size="sm" variant="ghost">
            ⚙️
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>Content with header action</p>
      </CardContent>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent>
        <p>Simple card with just content</p>
      </CardContent>
    </Card>
  ),
};

export const WithBorder: Story = {
  render: () => (
    <Card className="w-80 border">
      <CardHeader className="border-b">
        <CardTitle>Bordered Card</CardTitle>
        <CardDescription>This card has borders</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content with borders</p>
      </CardContent>
      <CardFooter className="border-t">
        <Button variant="outline">Action</Button>
      </CardFooter>
    </Card>
  ),
};
