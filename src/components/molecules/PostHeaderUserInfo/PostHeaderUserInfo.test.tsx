import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PostHeaderUserInfo } from './PostHeaderUserInfo';
import * as Libs from '@/libs';

// Mock atoms
vi.mock('@/atoms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/atoms')>();
  return {
    ...actual,
    Container: ({
      children,
      className,
      overrideDefaults,
    }: {
      children: React.ReactNode;
      className?: string;
      overrideDefaults?: boolean;
    }) => (
      <div data-testid="container" className={className} data-override-defaults={overrideDefaults}>
        {children}
      </div>
    ),
    Typography: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <p data-testid="typography" className={className}>
        {children}
      </p>
    ),
  };
});

// Mock molecules
vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    AvatarWithFallback: ({ avatarUrl, name, size }: { avatarUrl?: string; name: string; size?: string }) => (
      <div data-testid="avatar" data-size={size}>
        {avatarUrl ? <img data-testid="avatar-image" src={avatarUrl} alt={name} /> : null}
        <div data-testid="avatar-fallback">{name.substring(0, 2).toUpperCase()}</div>
      </div>
    ),
  };
});

// Mock libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
    formatPublicKey: vi.fn(({ key, length }) => key?.substring(0, length) || ''),
  };
});

describe('PostHeaderUserInfo', () => {
  it('renders user name and public key', () => {
    render(<PostHeaderUserInfo userId="userpubkykey" userName="Test User" />);

    const avatars = screen.getAllByTestId('avatar');
    expect(avatars.length).toBeGreaterThan(0);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    // formatPublicKey returns first 8 chars, so "userpubk"
    expect(screen.getByText('@userpubk')).toBeInTheDocument();
  });

  it('renders avatar with image when avatarUrl is provided', () => {
    render(<PostHeaderUserInfo userId="user123" userName="Test User" avatarUrl="https://example.com/avatar.png" />);

    const avatarImages = screen.getAllByTestId('avatar-image');
    expect(avatarImages.length).toBeGreaterThan(0);
    expect(avatarImages[0]).toHaveAttribute('src', 'https://example.com/avatar.png');
    expect(avatarImages[0]).toHaveAttribute('alt', 'Test User');
  });

  it('renders character limit when provided', () => {
    render(<PostHeaderUserInfo userId="user123" userName="Test User" characterLimit={{ count: 50, max: 280 }} />);

    expect(screen.getByText('50/280')).toBeInTheDocument();
  });

  it('does not render character limit when not provided', () => {
    render(<PostHeaderUserInfo userId="user123" userName="Test User" />);

    expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument();
  });

  it('formats public key correctly', () => {
    const formatSpy = vi.spyOn(Libs, 'formatPublicKey');
    formatSpy.mockReturnValue('userpubk');

    render(<PostHeaderUserInfo userId="userpubkykey" userName="Test User" />);

    expect(formatSpy).toHaveBeenCalledWith({ key: 'userpubkykey', length: 8 });
    expect(screen.getByText('@userpubk')).toBeInTheDocument();

    formatSpy.mockRestore();
  });
});

describe('PostHeaderUserInfo - Snapshots', () => {
  it('matches snapshot with all props', () => {
    const { container } = render(
      <PostHeaderUserInfo
        userId="snapshotUserKey"
        userName="Snapshot User"
        avatarUrl="https://example.com/avatar.png"
        characterLimit={{ count: 150, max: 280 }}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without avatarUrl', () => {
    const { container } = render(
      <PostHeaderUserInfo userId="snapshotUserKey" userName="Snapshot User" characterLimit={{ count: 50, max: 280 }} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without character count', () => {
    const { container } = render(
      <PostHeaderUserInfo
        userId="snapshotUserKey"
        userName="Snapshot User"
        avatarUrl="https://example.com/avatar.png"
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with minimal props', () => {
    const { container } = render(<PostHeaderUserInfo userId="user123" userName="Test User" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
