import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfilePageProfile } from './ProfilePageProfile';
import * as App from '@/app';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}));

// Mock useProfileHeader hook
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useProfileHeader: vi.fn(() => ({
      profileData: {
        name: 'Satoshi Nakamoto',
        bio: 'Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared.',
        publicKey: '1QX7GKW3abcdef1234567890',
        emoji: '🌴',
        status: 'Vacationing',
        avatarUrl: undefined,
        link: undefined,
      },
      handlers: {
        onEdit: vi.fn(),
        onCopyPublicKey: vi.fn(),
        onSignOut: vi.fn(() => {
          mockPush(App.AUTH_ROUTES.LOGOUT);
        }),
        onStatusClick: vi.fn(),
      },
      isLoading: false,
    })),
  };
});

// Mock organisms
vi.mock('@/organisms', () => ({
  ProfilePageHeader: ({
    name,
    bio,
    publicKey,
    emoji,
    status,
    link,
    onEdit,
    onCopyPublicKey,
    onSignOut,
    onStatusClick,
  }: {
    name: string;
    bio?: string;
    publicKey: string;
    emoji?: string;
    status: string;
    link?: string;
    onEdit?: () => void;
    onCopyPublicKey?: () => void;
    onSignOut?: () => void;
    onStatusClick?: () => void;
  }) => (
    <div data-testid="profile-page-header">
      <div>{name}</div>
      {bio && <div>{bio}</div>}
      <div>{publicKey}</div>
      {emoji && <div>{emoji}</div>}
      <div>{status}</div>
      {onEdit && <button onClick={onEdit}>Edit</button>}
      {onCopyPublicKey && <button onClick={onCopyPublicKey}>Copy Key</button>}
      {link && <a href={link}>Link</a>}
      {onSignOut && <button onClick={onSignOut}>Sign out</button>}
      {onStatusClick && <button onClick={onStatusClick}>Status</button>}
    </div>
  ),
}));

describe('ProfilePageProfile', () => {
  it('renders without errors', () => {
    render(<ProfilePageProfile />);
    expect(screen.getByTestId('profile-page-header')).toBeInTheDocument();
  });

  it('displays ProfilePageHeader with correct props', () => {
    render(<ProfilePageProfile />);

    expect(screen.getByText('Satoshi Nakamoto')).toBeInTheDocument();
    expect(
      screen.getByText('Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared.'),
    ).toBeInTheDocument();
    expect(screen.getByText('1QX7GKW3abcdef1234567890')).toBeInTheDocument();
    expect(screen.getByText('🌴')).toBeInTheDocument();
    expect(screen.getByText('Vacationing')).toBeInTheDocument();
  });

  it('is hidden on large screens', () => {
    const { container } = render(<ProfilePageProfile />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('lg:hidden');
  });

  it('navigates to logout page when sign out is clicked', () => {
    render(<ProfilePageProfile />);
    const signOutButton = screen.getByText('Sign out');
    fireEvent.click(signOutButton);

    expect(mockPush).toHaveBeenCalledWith(App.AUTH_ROUTES.LOGOUT);
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePageProfile />);
    expect(container).toMatchSnapshot();
  });
});
