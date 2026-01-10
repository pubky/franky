import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostHeaderUserInfoPopoverHeader } from './PostHeaderUserInfoPopoverHeader';

vi.mock('@/organisms', () => ({
  AvatarWithFallback: ({ name }: { name: string }) => <div data-testid="avatar">{name}</div>,
}));

describe('PostHeaderUserInfoPopoverHeader', () => {
  it('renders user name and public key', () => {
    render(<PostHeaderUserInfoPopoverHeader userName="Test User" formattedPublicKey="test123" avatarUrl="x" />);
    expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
    expect(screen.getByText('test123')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });
});

describe('PostHeaderUserInfoPopoverHeader - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <PostHeaderUserInfoPopoverHeader userName="Snapshot User" formattedPublicKey="snapshot123" avatarUrl="x" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
