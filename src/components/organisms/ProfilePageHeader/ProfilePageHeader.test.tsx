import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProfilePageHeader } from './ProfilePageHeader';

const mockProps = {
  name: 'Satoshi Nakamoto',
  bio: 'Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared.',
  publicKey: '1QX7GKW3abcdef1234567890',
  status: 'Vacationing',
  emoji: '🌴',
  link: 'https://example.com',
  onEdit: vi.fn(),
  onCopyPublicKey: vi.fn(),
  onCopyLink: vi.fn(),
  onSignOut: vi.fn(),
  onStatusClick: vi.fn(),
};

describe('ProfilePageHeader', () => {
  it('renders name and bio correctly', () => {
    render(<ProfilePageHeader {...mockProps} />);

    expect(screen.getByText('Satoshi Nakamoto')).toBeInTheDocument();
    expect(
      screen.getByText('Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared.'),
    ).toBeInTheDocument();
  });

  it('renders formatted public key', () => {
    render(<ProfilePageHeader {...mockProps} />);

    // formatPublicKey with length 12: first 6 + ... + last 6
    expect(screen.getByText(/1QX7GK\.\.\.567890/)).toBeInTheDocument();
  });

  it('renders all action buttons', () => {
    render(<ProfilePageHeader {...mockProps} />);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText(/1QX7GK\.\.\.567890/)).toBeInTheDocument();
    expect(screen.getByText('Link')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
    expect(screen.getByText('Vacationing')).toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<ProfilePageHeader {...mockProps} onEdit={onEdit} />);

    const editButton = screen.getByText('Edit').closest('button');
    fireEvent.click(editButton!);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onCopyPublicKey when public key button is clicked', () => {
    const onCopyPublicKey = vi.fn();
    render(<ProfilePageHeader {...mockProps} onCopyPublicKey={onCopyPublicKey} />);

    // Find button containing the formatted public key
    const publicKeyButton = screen.getByText(/1QX7GK/).closest('button');
    fireEvent.click(publicKeyButton!);

    expect(onCopyPublicKey).toHaveBeenCalledTimes(1);
  });

  it('calls onSignOut when Sign out button is clicked', () => {
    const onSignOut = vi.fn();
    render(<ProfilePageHeader {...mockProps} onSignOut={onSignOut} />);

    const signOutButton = screen.getByText('Sign out').closest('button');
    fireEvent.click(signOutButton!);

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('calls onCopyLink when Link button is clicked', () => {
    const onCopyLink = vi.fn();
    render(<ProfilePageHeader {...mockProps} onCopyLink={onCopyLink} />);

    const linkButton = screen.getByText('Link').closest('button');
    fireEvent.click(linkButton!);

    expect(onCopyLink).toHaveBeenCalledTimes(1);
  });

  it('renders avatar with fallback initials when no avatarUrl', () => {
    render(<ProfilePageHeader {...mockProps} avatarUrl={undefined} />);

    expect(screen.getByText('SN')).toBeInTheDocument();
  });

  it('renders emoji badge', () => {
    render(<ProfilePageHeader {...mockProps} />);

    // Emoji appears in both badge and status picker, so check for multiple instances
    const emojis = screen.getAllByText('🌴');
    expect(emojis.length).toBeGreaterThan(0);
  });

  it('renders without bio', () => {
    render(<ProfilePageHeader {...mockProps} bio={undefined} />);

    expect(screen.getByText('Satoshi Nakamoto')).toBeInTheDocument();
    expect(
      screen.queryByText('Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared.'),
    ).not.toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePageHeader {...mockProps} />);
    expect(container).toMatchSnapshot();
  });
});
