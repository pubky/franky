import { FlatNotification, NotificationType } from '@/core/models/notification/notification.types';
import * as Libs from '@/libs';

// Mock user data with names and Figma avatar URLs
const mockUsers = [
  {
    id: 'user1pubky123456789012345678901234567890',
    name: 'Anna',
    avatar: 'https://www.figma.com/api/mcp/asset/4258d8ac-23fe-4321-8e35-bb447f9d60d0',
  },
  {
    id: 'user2pubky123456789012345678901234567890',
    name: 'John',
    avatar: 'https://www.figma.com/api/mcp/asset/1eb11916-a111-47ee-b87d-5666a84d4f35',
  },
  {
    id: 'user3pubky123456789012345678901234567890',
    name: 'Adam',
    avatar: 'https://www.figma.com/api/mcp/asset/74fd1794-91f6-4640-abeb-ecb1b0d37d30',
  },
  {
    id: 'user4pubky123456789012345678901234567890',
    name: 'Mark',
    avatar: 'https://www.figma.com/api/mcp/asset/51166c0d-f9b1-46b9-89fe-4d6d9c33ed0d',
  },
  {
    id: 'user5pubky123456789012345678901234567890',
    name: 'Christopher Kempczinski',
    avatar: 'https://www.figma.com/api/mcp/asset/8c4f05ac-6b2d-4773-8428-0a923b89db3b',
  },
];

// Base notifications
const baseNotifications: FlatNotification[] = [
  // Follow notification
  {
    type: NotificationType.Follow,
    timestamp: Libs.minutesAgo(37),
    followed_by: mockUsers[0].id,
  },
  // Unfollow notification
  {
    type: NotificationType.LostFriend,
    timestamp: Libs.minutesAgo(59),
    unfollowed_by: mockUsers[3].id,
  },
  // New friend notification
  {
    type: NotificationType.NewFriend,
    timestamp: Libs.hoursAgo(3),
    followed_by: mockUsers[2].id,
  },
  // Tag post notification
  {
    type: NotificationType.TagPost,
    timestamp: Libs.minutesAgo(25),
    tagged_by: mockUsers[0].id,
    tag_label: 'bitcoin',
    post_uri: 'user1:post123',
  },
  // Tag profile notification
  {
    type: NotificationType.TagProfile,
    timestamp: Libs.hoursAgo(15),
    tagged_by: mockUsers[0].id,
    tag_label: 'based',
  },
  // Reply notification
  {
    type: NotificationType.Reply,
    timestamp: Libs.hoursAgo(1),
    replied_by: mockUsers[1].id,
    parent_post_uri: 'currentuser:post456',
    reply_uri: 'user2:reply789',
  },
  // Repost notification
  {
    type: NotificationType.Repost,
    timestamp: Libs.daysAgo(2),
    reposted_by: mockUsers[2].id,
    embed_uri: 'currentuser:post456',
    repost_uri: 'user3:repost123',
  },
  // Mention notification
  {
    type: NotificationType.Mention,
    timestamp: Libs.minutesAgo(15),
    mentioned_by: mockUsers[1].id,
    post_uri: 'user2:post456',
  },
  // Post deleted notification
  {
    type: NotificationType.PostDeleted,
    timestamp: Libs.daysAgo(4),
    delete_source: 'reply' as 'reply' | 'embed',
    deleted_by: mockUsers[2].id,
    deleted_uri: 'user3:post789',
    linked_uri: 'currentuser:post456',
  },
];

// Triple the notifications for scrolling test
export const mockNotifications: FlatNotification[] = [
  ...baseNotifications,
  ...baseNotifications.map((n, i) => ({ ...n, timestamp: n.timestamp - 1000 * 60 * 60 * i })),
  ...baseNotifications.map((n, i) => ({ ...n, timestamp: n.timestamp - 1000 * 60 * 60 * 24 * i })),
];

// Export user data for use in components
export const mockUserData = Object.fromEntries(mockUsers.map((u) => [u.id, u]));
