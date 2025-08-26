import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PopoverInvite } from './PopoverInvite';

// Mock @/libs to intercept all icons and utilities
vi.mock('@/libs', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  SocialLinks: {
    EMAIL: 'mailto:hello@pubky.com',
    TWITTER: 'https://x.com/pubky',
    TELEGRAM: 'https://t.me/pubky',
  },
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
    const xtwitterIcon = screen.getByTestId('xtwitter-icon');
    const telegramIcon = screen.getByTestId('telegram-icon');

    expect(mailIcon).toBeInTheDocument();
    expect(xtwitterIcon).toBeInTheDocument();
    expect(telegramIcon).toBeInTheDocument();

    // Check icons have proper classes
    expect(mailIcon).toHaveClass('h-6', 'w-6');
    expect(xtwitterIcon).toHaveClass('h-6', 'w-6');
    expect(telegramIcon).toHaveClass('h-6', 'w-6');
  });

  it('uses default URLs when no custom URLs provided', () => {
    render(<PopoverInvite />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const mailLink = screen.getByTestId('mail-icon').parentElement;
    const twitterLink = screen.getByTestId('xtwitter-icon').parentElement;
    const telegramLink = screen.getByTestId('telegram-icon').parentElement;

    expect(mailLink).toHaveAttribute('href', 'mailto:hello@pubky.com');
    expect(twitterLink).toHaveAttribute('href', 'https://x.com/pubky');
    expect(telegramLink).toHaveAttribute('href', 'https://t.me/pubky');
  });

  it('uses default URLs', () => {
    render(<PopoverInvite />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const mailLink = screen.getByTestId('mail-icon').parentElement;
    const twitterLink = screen.getByTestId('xtwitter-icon').parentElement;
    const telegramLink = screen.getByTestId('telegram-icon').parentElement;

    expect(mailLink).toHaveAttribute('href', 'mailto:hello@pubky.com');
    expect(twitterLink).toHaveAttribute('href', 'https://x.com/pubky');
    expect(telegramLink).toHaveAttribute('href', 'https://t.me/pubky');
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
