import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationIcon } from './NotificationIcon';
import { NotificationType } from '@/core/models/notification/notification.types';

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    style,
    overrideDefaults,
  }: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    overrideDefaults?: boolean;
  }) => (
    <div data-testid="container" className={className} style={style} data-override={overrideDefaults}>
      {children}
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  UserRoundPlus: ({ className, size }: { className?: string; size?: number }) => (
    <svg data-testid="icon-follow" data-size={size} className={className}>
      FollowIcon
    </svg>
  ),
  HeartHandshake: ({ className, size }: { className?: string; size?: number }) => (
    <svg data-testid="icon-new-friend" data-size={size} className={className}>
      NewFriendIcon
    </svg>
  ),
  UserRoundMinus: ({ className, size }: { className?: string; size?: number }) => (
    <svg data-testid="icon-lost-friend" data-size={size} className={className}>
      LostFriendIcon
    </svg>
  ),
  Tag: ({ className, size }: { className?: string; size?: number }) => (
    <svg data-testid="icon-tag" data-size={size} className={className}>
      TagIcon
    </svg>
  ),
  MessageCircle: ({ className, size }: { className?: string; size?: number }) => (
    <svg data-testid="icon-reply" data-size={size} className={className}>
      ReplyIcon
    </svg>
  ),
  Repeat: ({ className, size }: { className?: string; size?: number }) => (
    <svg data-testid="icon-repost" data-size={size} className={className}>
      RepostIcon
    </svg>
  ),
  AtSign: ({ className, size }: { className?: string; size?: number }) => (
    <svg data-testid="icon-mention" data-size={size} className={className}>
      MentionIcon
    </svg>
  ),
  Trash2: ({ className, size }: { className?: string; size?: number }) => (
    <svg data-testid="icon-post-deleted" data-size={size} className={className}>
      PostDeletedIcon
    </svg>
  ),
  StickyNote: ({ className, size }: { className?: string; size?: number }) => (
    <svg data-testid="icon-post-edited" data-size={size} className={className}>
      PostEditedIcon
    </svg>
  ),
}));

describe('NotificationIcon', () => {
  it('renders Follow icon for Follow notification type', () => {
    render(<NotificationIcon type={NotificationType.Follow} showBadge={false} />);
    expect(screen.getByTestId('icon-follow')).toBeInTheDocument();
  });

  it('renders NewFriend icon for NewFriend notification type', () => {
    render(<NotificationIcon type={NotificationType.NewFriend} showBadge={false} />);
    expect(screen.getByTestId('icon-new-friend')).toBeInTheDocument();
  });

  it('renders LostFriend icon for LostFriend notification type', () => {
    render(<NotificationIcon type={NotificationType.LostFriend} showBadge={false} />);
    expect(screen.getByTestId('icon-lost-friend')).toBeInTheDocument();
  });

  it('renders Tag icon for TagPost notification type', () => {
    render(<NotificationIcon type={NotificationType.TagPost} showBadge={false} />);
    expect(screen.getByTestId('icon-tag')).toBeInTheDocument();
  });

  it('renders Tag icon for TagProfile notification type', () => {
    render(<NotificationIcon type={NotificationType.TagProfile} showBadge={false} />);
    expect(screen.getByTestId('icon-tag')).toBeInTheDocument();
  });

  it('renders Reply icon for Reply notification type', () => {
    render(<NotificationIcon type={NotificationType.Reply} showBadge={false} />);
    expect(screen.getByTestId('icon-reply')).toBeInTheDocument();
  });

  it('renders Repost icon for Repost notification type', () => {
    render(<NotificationIcon type={NotificationType.Repost} showBadge={false} />);
    expect(screen.getByTestId('icon-repost')).toBeInTheDocument();
  });

  it('renders Mention icon for Mention notification type', () => {
    render(<NotificationIcon type={NotificationType.Mention} showBadge={false} />);
    expect(screen.getByTestId('icon-mention')).toBeInTheDocument();
  });

  it('renders PostDeleted icon for PostDeleted notification type', () => {
    render(<NotificationIcon type={NotificationType.PostDeleted} showBadge={false} />);
    expect(screen.getByTestId('icon-post-deleted')).toBeInTheDocument();
  });

  it('renders PostEdited icon for PostEdited notification type', () => {
    render(<NotificationIcon type={NotificationType.PostEdited} showBadge={false} />);
    expect(screen.getByTestId('icon-post-edited')).toBeInTheDocument();
  });

  it('renders icon with correct size', () => {
    render(<NotificationIcon type={NotificationType.Follow} showBadge={false} />);
    const icon = screen.getByTestId('icon-follow');
    expect(icon).toHaveAttribute('data-size', '24');
  });

  it('renders badge when showBadge is true', () => {
    const { container } = render(<NotificationIcon type={NotificationType.Follow} showBadge={true} />);
    const badge = container.querySelector('[style*="width: 11px"]');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ width: '11px', height: '11px' });
  });

  it('does not render badge when showBadge is false', () => {
    const { container } = render(<NotificationIcon type={NotificationType.Follow} showBadge={false} />);
    const badge = container.querySelector('[style*="width: 11px"]');
    expect(badge).not.toBeInTheDocument();
  });

  it('renders container with correct size', () => {
    const { container } = render(<NotificationIcon type={NotificationType.Follow} showBadge={false} />);
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveStyle({ width: '24px', height: '24px' });
  });

  it('applies correct classes to container', () => {
    const { container } = render(<NotificationIcon type={NotificationType.Follow} showBadge={false} />);
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('relative', 'shrink-0');
  });

  it('applies correct classes to badge', () => {
    const { container } = render(<NotificationIcon type={NotificationType.Follow} showBadge={true} />);
    const badge = container.querySelector('[style*="width: 11px"]') as HTMLElement;
    expect(badge).toHaveClass('absolute', 'right-0', 'bottom-0', 'rounded-full');
  });

  it('applies brand color to badge class', () => {
    const { container } = render(<NotificationIcon type={NotificationType.Follow} showBadge={true} />);
    const badge = container.querySelector('[style*="width: 11px"]') as HTMLElement;
    expect(badge).toHaveClass('bg-brand');
  });
});

describe('NotificationIcon - Snapshots', () => {
  it('matches snapshot for Follow notification without badge', () => {
    const { container } = render(<NotificationIcon type={NotificationType.Follow} showBadge={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for Follow notification with badge', () => {
    const { container } = render(<NotificationIcon type={NotificationType.Follow} showBadge={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for TagPost notification with badge', () => {
    const { container } = render(<NotificationIcon type={NotificationType.TagPost} showBadge={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for Reply notification without badge', () => {
    const { container } = render(<NotificationIcon type={NotificationType.Reply} showBadge={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for Mention notification with badge', () => {
    const { container } = render(<NotificationIcon type={NotificationType.Mention} showBadge={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
