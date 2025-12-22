import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchRecentUserItem } from './SearchRecentUserItem';
import type { Pubky } from '@/core';

vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    onClick,
    ...props
  }: React.PropsWithChildren<{ className?: string; onClick?: () => void }>) => (
    <div className={className} onClick={onClick} {...props}>
      {children}
    </div>
  ),
  Typography: ({
    children,
    className,
    as: Component = 'span',
    ...props
  }: React.PropsWithChildren<{ className?: string; as?: React.ElementType }>) => (
    <Component className={className} {...props}>
      {children}
    </Component>
  ),
}));

vi.mock('@/molecules', () => ({
  AvatarWithFallback: ({ name, avatarUrl, size }: { name: string; avatarUrl?: string; size: string }) => (
    <div data-testid="avatar" data-name={name} data-avatar-url={avatarUrl || ''} data-size={size}>
      Avatar
    </div>
  ),
}));

vi.mock('@/libs', () => ({
  formatPublicKey: ({ key, length }: { key: string; length: number }) => `${key.slice(0, length)}...`,
  truncateString: (str: string, maxLength: number) => {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return `${str.slice(0, maxLength)}...`;
  },
}));

vi.mock('@/hooks', () => ({
  useUserDetails: (userId: string) => ({
    userDetails: {
      id: userId,
      name: 'Test User',
      image: 'test-image.jpg',
    },
    isLoading: false,
  }),
  useAvatarUrl: () => 'https://example.com/avatar.jpg',
}));

describe('SearchRecentUserItem', () => {
  const mockUser = {
    id: 'pk:abc123' as Pubky,
    searchedAt: Date.now(),
  };

  it('renders user name from userDetails', () => {
    render(<SearchRecentUserItem user={mockUser} onClick={vi.fn()} />);

    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
  });

  it('renders formatted pubky', () => {
    render(<SearchRecentUserItem user={mockUser} onClick={vi.fn()} />);

    expect(screen.getByTestId('user-pubky')).toHaveTextContent('@pk:abc12...');
  });

  it('renders avatar with avatar url', () => {
    render(<SearchRecentUserItem user={mockUser} onClick={vi.fn()} />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveAttribute('data-avatar-url', 'https://example.com/avatar.jpg');
    expect(avatar).toHaveAttribute('data-name', 'Test User');
  });

  it('calls onClick with user id when clicked', () => {
    const onClick = vi.fn();
    render(<SearchRecentUserItem user={mockUser} onClick={onClick} />);

    fireEvent.click(screen.getByTestId(`recent-user-${mockUser.id}`));

    expect(onClick).toHaveBeenCalledWith(mockUser.id);
  });

  describe('Snapshots', () => {
    it('matches snapshot', () => {
      const { container } = render(<SearchRecentUserItem user={mockUser} onClick={vi.fn()} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
