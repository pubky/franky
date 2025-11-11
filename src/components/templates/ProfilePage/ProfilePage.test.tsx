import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfilePage } from './ProfilePage';
import * as App from '@/app';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  ProfilePageHeader: ({
    name,
    bio,
    publicKey,
    emoji,
    status,
    onEdit,
    onCopyPublicKey,
    onLinkClick,
    onSignOut,
    onStatusClick,
  }: {
    name: string;
    bio?: string;
    publicKey: string;
    emoji?: string;
    status: string;
    onEdit?: () => void;
    onCopyPublicKey?: () => void;
    onLinkClick?: () => void;
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
      {onLinkClick && <button onClick={onLinkClick}>Link</button>}
      {onSignOut && <button onClick={onSignOut}>Sign out</button>}
      {onStatusClick && <button onClick={onStatusClick}>Status</button>}
    </div>
  ),
}));

describe('ProfilePage', () => {
  it('renders without errors', () => {
    render(<ProfilePage />);
    expect(screen.getByTestId('profile-page-header')).toBeInTheDocument();
  });

  it('displays ProfilePageHeader with correct props', () => {
    render(<ProfilePage />);

    expect(screen.getByText('Satoshi Nakamoto')).toBeInTheDocument();
    expect(
      screen.getByText('Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared.'),
    ).toBeInTheDocument();
    expect(screen.getByText('1QX7GKW3abcdef1234567890')).toBeInTheDocument();
    expect(screen.getByText('🌴')).toBeInTheDocument();
    expect(screen.getByText('Vacationing')).toBeInTheDocument();
  });

  it('renders all action buttons', () => {
    render(<ProfilePage />);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Copy Key')).toBeInTheDocument();
    expect(screen.getByText('Link')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('navigates to logout page when sign out is clicked', async () => {
    const { useRouter } = await import('next/navigation');
    const mockPush = vi.fn();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });

    render(<ProfilePage />);
    const signOutButton = screen.getByText('Sign out');
    fireEvent.click(signOutButton);

    expect(mockPush).toHaveBeenCalledWith(App.AUTH_ROUTES.LOGOUT);
  });

  it('calls handlers when buttons are clicked', () => {
    render(<ProfilePage />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    const copyKeyButton = screen.getByText('Copy Key');
    fireEvent.click(copyKeyButton);

    const linkButton = screen.getByText('Link');
    fireEvent.click(linkButton);

    const statusButton = screen.getByText('Status');
    fireEvent.click(statusButton);
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePage />);
    expect(container).toMatchSnapshot();
  });
});
