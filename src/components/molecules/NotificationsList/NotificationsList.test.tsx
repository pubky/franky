import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationsList } from './NotificationsList';
import { FlatNotification, NotificationType } from '@/core/models/notification/notification.types';

// Mock NotificationItem
vi.mock('@/molecules/NotificationItem', () => ({
  NotificationItem: ({ notification }: { notification: FlatNotification }) => (
    <div data-testid="notification-item" data-type={notification.type}>
      {notification.type}
    </div>
  ),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

describe('NotificationsList', () => {
  const mockNotifications = [
    {
      type: NotificationType.Follow,
      timestamp: Date.now() - 1000 * 60 * 30,
      followed_by: 'user1',
    },
    {
      type: NotificationType.Reply,
      timestamp: Date.now() - 1000 * 60 * 60,
      replied_by: 'user2',
      parent_post_uri: 'user1:post123',
      reply_uri: 'user2:reply456',
    },
    {
      type: NotificationType.TagPost,
      timestamp: Date.now() - 1000 * 60 * 60 * 2,
      tagged_by: 'user3',
      tag_label: 'bitcoin',
      post_uri: 'user3:post789',
    },
  ];

  it('renders list of notifications', () => {
    render(<NotificationsList notifications={mockNotifications} />);
    const items = screen.getAllByTestId('notification-item');
    expect(items).toHaveLength(3);
  });

  it('renders empty list when no notifications', () => {
    render(<NotificationsList notifications={[]} />);
    const items = screen.queryAllByTestId('notification-item');
    expect(items).toHaveLength(0);
  });

  it('renders notifications in correct order', () => {
    render(<NotificationsList notifications={mockNotifications} />);
    const items = screen.getAllByTestId('notification-item');
    expect(items[0]).toHaveAttribute('data-type', NotificationType.Follow);
    expect(items[1]).toHaveAttribute('data-type', NotificationType.Reply);
    expect(items[2]).toHaveAttribute('data-type', NotificationType.TagPost);
  });
});

describe('NotificationsList - Snapshots', () => {
  it('matches snapshot with notifications', () => {
    const notifications = [
      {
        type: NotificationType.Follow,
        timestamp: Date.now() - 1000 * 60 * 30,
        followed_by: 'user1',
      },
      {
        type: NotificationType.Reply,
        timestamp: Date.now() - 1000 * 60 * 60,
        replied_by: 'user2',
        parent_post_uri: 'user1:post123',
        reply_uri: 'user2:reply456',
      },
    ];
    const { container } = render(<NotificationsList notifications={notifications} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty list', () => {
    const { container } = render(<NotificationsList notifications={[]} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
