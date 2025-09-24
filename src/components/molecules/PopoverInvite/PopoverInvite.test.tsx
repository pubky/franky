import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PopoverInvite } from './PopoverInvite';
import { EMAIL_URL, TWITTER_URL, TELEGRAM_URL } from '@/config';

// Mock @/libs to intercept all icons and utilities
vi.mock('@/libs', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  Gift: ({ className }: { className?: string }) => (
    <div data-testid="gift-icon" className={className}>
      Gift
    </div>
  ),
  Mail: ({ className }: { className?: string }) => (
    <div data-testid="mail-icon" className={className}>
      Mail
    </div>
  ),
  XTwitter: ({ className }: { className?: string }) => (
    <div data-testid="xtwitter-icon" className={className}>
      XTwitter
    </div>
  ),
  Telegram: ({ className }: { className?: string }) => (
    <div data-testid="telegram-icon" className={className}>
      Telegram
    </div>
  ),
  Radio: ({ className }: { className?: string }) => (
    <div data-testid="radio-icon" className={className}>
      Radio
    </div>
  ),
  UsersRound2: ({ className }: { className?: string }) => (
    <div data-testid="users-round2-icon" className={className}>
      UsersRound2
    </div>
  ),
  HeartHandshake: ({ className }: { className?: string }) => (
    <div data-testid="heart-handshake-icon" className={className}>
      HeartHandshake
    </div>
  ),
  UserRound: ({ className }: { className?: string }) => (
    <div data-testid="user-round-icon" className={className}>
      UserRound
    </div>
  ),
  SquareAsterisk: ({ className }: { className?: string }) => (
    <div data-testid="square-asterisk-icon" className={className}>
      SquareAsterisk
    </div>
  ),
  Flame: ({ className }: { className?: string }) => (
    <div data-testid="flame-icon" className={className}>
      Flame
    </div>
  ),
  Columns3: ({ className }: { className?: string }) => (
    <div data-testid="columns3-icon" className={className}>
      Columns3
    </div>
  ),
  Menu: ({ className }: { className?: string }) => (
    <div data-testid="menu-icon" className={className}>
      Menu
    </div>
  ),
  LayoutGrid: ({ className }: { className?: string }) => (
    <div data-testid="layout-grid-icon" className={className}>
      LayoutGrid
    </div>
  ),
  Layers: ({ className }: { className?: string }) => (
    <div data-testid="layers-icon" className={className}>
      Layers
    </div>
  ),
  StickyNote: ({ className }: { className?: string }) => (
    <div data-testid="sticky-note-icon" className={className}>
      StickyNote
    </div>
  ),
  Newspaper: ({ className }: { className?: string }) => (
    <div data-testid="newspaper-icon" className={className}>
      Newspaper
    </div>
  ),
  Image: ({ className }: { className?: string }) => (
    <div data-testid="image-icon" className={className}>
      Image
    </div>
  ),
  CirclePlay: ({ className }: { className?: string }) => (
    <div data-testid="circle-play-icon" className={className}>
      CirclePlay
    </div>
  ),
  Link: ({ className }: { className?: string }) => (
    <div data-testid="link-icon" className={className}>
      Link
    </div>
  ),
  Download: ({ className }: { className?: string }) => (
    <div data-testid="download-icon" className={className}>
      Download
    </div>
  ),
}));

describe('InvitePopover', () => {
  it('renders trigger button with gift icon', () => {
    render(<PopoverInvite />);

    const button = screen.getByRole('button');
    const giftIcon = screen.getByTestId('gift-icon');

    expect(button).toBeInTheDocument();
    expect(giftIcon).toBeInTheDocument();
    expect(giftIcon).toHaveClass('h-4', 'w-4', 'text-brand');
  });

  it('shows popover content when clicked', () => {
    render(<PopoverInvite />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText("Don't have an invite yet?")).toBeInTheDocument();
    expect(screen.getByText('Ask the Pubky team!')).toBeInTheDocument();
  });

  it('renders social contact links in popover', () => {
    render(<PopoverInvite />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const mailIcon = screen.getByTestId('mail-icon');
    const twitterIcon = screen.getByTestId('xtwitter-icon');
    const telegramIcon = screen.getByTestId('telegram-icon');

    expect(mailIcon).toBeInTheDocument();
    expect(twitterIcon).toBeInTheDocument();
    expect(telegramIcon).toBeInTheDocument();

    // Check icons have proper classes
    expect(mailIcon).toHaveClass('h-6', 'w-6');
    expect(twitterIcon).toHaveClass('h-6', 'w-6');
    expect(telegramIcon).toHaveClass('h-6', 'w-6');
  });

  it('uses default URLs when no custom URLs provided', () => {
    render(<PopoverInvite />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const mailLink = screen.getByTestId('mail-icon').parentElement;
    const twitterLink = screen.getByTestId('xtwitter-icon').parentElement;
    const telegramLink = screen.getByTestId('telegram-icon').parentElement;

    expect(mailLink).toHaveAttribute('href', EMAIL_URL);
    expect(twitterLink).toHaveAttribute('href', TWITTER_URL);
    expect(telegramLink).toHaveAttribute('href', TELEGRAM_URL);
  });

  it('uses default URLs', () => {
    render(<PopoverInvite />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const mailLink = screen.getByTestId('mail-icon').parentElement;
    const twitterLink = screen.getByTestId('xtwitter-icon').parentElement;
    const telegramLink = screen.getByTestId('telegram-icon').parentElement;

    expect(mailLink).toHaveAttribute('href', EMAIL_URL);
    expect(twitterLink).toHaveAttribute('href', TWITTER_URL);
    expect(telegramLink).toHaveAttribute('href', TELEGRAM_URL);
  });

  it('applies custom className to trigger button', () => {
    render(<PopoverInvite className="custom-invite-class" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-invite-class');
  });

  it('has proper popover content structure', () => {
    render(<PopoverInvite />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Check the popover content structure
    const heading = screen.getByText("Don't have an invite yet?");
    const description = screen.getByText('Ask the Pubky team!');

    // Check that the components are rendered
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-popover-foreground');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('font-normal', 'text-muted-foreground');
  });
});
