import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationItem } from './NotificationItem';
import { NotificationType } from '@/core/models/notification/notification.types';
import * as Libs from '@/libs';

// Mock hooks
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    getNotificationUserData: vi.fn((userId: string) => {
      const mockUsers: Record<string, { name: string; avatar?: string }> = {
        user1: { name: 'Anna', avatar: 'https://example.com/anna.jpg' },
        user2: { name: 'John', avatar: 'https://example.com/john.jpg' },
        user3: { name: 'Adam' },
      };
      return mockUsers[userId] || null;
    }),
  };
});

// Mock libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    formatNotificationTime: vi.fn((timestamp: number) => {
      const diffMs = Date.now() - timestamp;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      return '1h';
    }),
  };
});

// Mock molecules
vi.mock('@/molecules', () => ({
  AvatarWithFallback: ({ name, avatarUrl, className }: { name: string; avatarUrl?: string; className?: string }) => (
    <div data-testid="avatar-with-fallback" data-name={name} data-avatar={avatarUrl} className={className}>
      {avatarUrl ? <img src={avatarUrl} alt={name} /> : <span>{name[0]}</span>}
    </div>
  ),
  PostTag: ({ label }: { label: string }) => <span data-testid="post-tag">{label}</span>,
  NotificationIcon: ({ type, showBadge }: { type: NotificationType; showBadge?: boolean }) => (
    <div data-testid="notification-icon" data-type={type} data-badge={showBadge ? 'true' : 'false'}>
      Icon
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
  Typography: ({ children, as, className }: { children: React.ReactNode; as?: string; className?: string }) => {
    const Tag = as || 'p';
    return (
      <Tag data-testid="typography" className={className}>
        {children}
      </Tag>
    );
  },
}));

describe('NotificationItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseNotification = {
    type: NotificationType.Follow,
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    followed_by: 'user1',
  };

  it('renders notification text correctly', () => {
    render(<NotificationItem notification={baseNotification} isUnread={false} />);
    expect(screen.getByText(/User followed you/i)).toBeInTheDocument();
  });

  it('renders avatar with user data', () => {
    render(<NotificationItem notification={baseNotification} isUnread={false} />);
    const avatar = screen.getByTestId('avatar-with-fallback');
    expect(avatar).toHaveAttribute('data-name', 'User');
    expect(avatar).not.toHaveAttribute('data-avatar');
  });

  it('renders timestamp', () => {
    render(<NotificationItem notification={baseNotification} isUnread={false} />);
    expect(Libs.formatNotificationTime).toHaveBeenCalledWith(baseNotification.timestamp, false);
    expect(Libs.formatNotificationTime).toHaveBeenCalledWith(baseNotification.timestamp, true);
  });

  it('renders notification icon', () => {
    render(<NotificationItem notification={baseNotification} isUnread={false} />);
    const icon = screen.getByTestId('notification-icon');
    expect(icon).toHaveAttribute('data-type', NotificationType.Follow);
  });

  it('shows badge for recent notifications', () => {
    const recentNotification = {
      ...baseNotification,
      timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    };
    render(<NotificationItem notification={recentNotification} isUnread={true} />);
    const icon = screen.getByTestId('notification-icon');
    expect(icon).toHaveAttribute('data-badge', 'true');
  });

  it('does not show badge for old notifications', () => {
    const oldNotification = {
      ...baseNotification,
      timestamp: Date.now() - 1000 * 60 * 60 * 25, // 25 hours ago
    };
    render(<NotificationItem notification={oldNotification} isUnread={false} />);
    const icon = screen.getByTestId('notification-icon');
    expect(icon).toHaveAttribute('data-badge', 'false');
  });

  it('renders tag badge for TagPost notifications', () => {
    const tagNotification = {
      type: NotificationType.TagPost,
      timestamp: Date.now() - 1000 * 60 * 30,
      tagged_by: 'user1',
      tag_label: 'bitcoin',
      post_uri: 'user1:post123',
    };
    render(<NotificationItem notification={tagNotification} isUnread={false} />);
    expect(screen.getByTestId('post-tag')).toBeInTheDocument();
    expect(screen.getByText('bitcoin')).toBeInTheDocument();
  });

  it('renders post preview for Mention notifications on desktop', () => {
    const mentionNotification = {
      type: NotificationType.Mention,
      timestamp: Date.now() - 1000 * 60 * 30,
      mentioned_by: 'user1',
      post_uri: 'user1:post123',
    };
    render(<NotificationItem notification={mentionNotification} isUnread={false} />);
    expect(screen.getByText(/The reason why.../i)).toBeInTheDocument();
  });

  it('handles missing user data gracefully', () => {
    const notificationWithUnknownUser = {
      ...baseNotification,
      followed_by: 'unknown-user',
    };
    render(<NotificationItem notification={notificationWithUnknownUser} isUnread={false} />);
    expect(screen.getByText(/User followed you/i)).toBeInTheDocument();
  });
});

describe('NotificationItem - Snapshots', () => {
  it('matches snapshot for Follow notification', () => {
    const notification = {
      type: NotificationType.Follow,
      timestamp: Date.now() - 1000 * 60 * 30,
      followed_by: 'user1',
    };
    const { container } = render(<NotificationItem notification={notification} isUnread={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for TagPost notification', () => {
    const notification = {
      type: NotificationType.TagPost,
      timestamp: Date.now() - 1000 * 60 * 30,
      tagged_by: 'user1',
      tag_label: 'bitcoin',
      post_uri: 'user1:post123',
    };
    const { container } = render(<NotificationItem notification={notification} isUnread={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for Mention notification', () => {
    const notification = {
      type: NotificationType.Mention,
      timestamp: Date.now() - 1000 * 60 * 30,
      mentioned_by: 'user1',
      post_uri: 'user1:post123',
    };
    const { container } = render(<NotificationItem notification={notification} isUnread={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
