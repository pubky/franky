import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProfileSidebarLinks } from './ProfileSidebarLinks';

const meta: Meta<typeof ProfileSidebarLinks> = {
  title: 'Molecules/ProfileSidebarLinks',
  component: ProfileSidebarLinks,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    links: [
      { title: 'Twitter', url: 'https://twitter.com/johndoe' },
      { title: 'GitHub', url: 'https://github.com/johndoe' },
      { title: 'LinkedIn', url: 'https://linkedin.com/in/johndoe' },
    ],
  },
};

export const AllSocialPlatforms: Story = {
  args: {
    links: [
      { title: 'Twitter', url: 'https://twitter.com/johndoe' },
      { title: 'X', url: 'https://x.com/johndoe' },
      { title: 'GitHub', url: 'https://github.com/johndoe' },
      { title: 'Telegram', url: 'https://t.me/johndoe' },
      { title: 'LinkedIn', url: 'https://linkedin.com/in/johndoe' },
      { title: 'Instagram', url: 'https://instagram.com/johndoe' },
      { title: 'Facebook', url: 'https://facebook.com/johndoe' },
      { title: 'YouTube', url: 'https://youtube.com/@johndoe' },
    ],
  },
};

export const WithEmail: Story = {
  args: {
    links: [
      { title: 'Email', url: 'mailto:john@example.com' },
      { title: 'Website', url: 'https://johndoe.com' },
    ],
  },
};

export const Empty: Story = {
  args: {
    links: [],
  },
};
