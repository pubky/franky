import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PopoverInvite } from './PopoverInvite';
import { EMAIL_URL, TWITTER_URL, TELEGRAM_URL } from '@/config';
import { normaliseRadixIds } from '@/libs/utils/utils';

// Mock @/libs to intercept all icons and utilities
// Mock libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

describe('InvitePopover', () => {
  it('renders trigger button with gift icon', () => {
    render(<PopoverInvite />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(document.querySelector('.lucide-gift')).toBeInTheDocument();
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

    expect(document.querySelector('.lucide-mail')).toBeInTheDocument();
    expect(document.querySelector('.lucide-x-twitter')).toBeInTheDocument();
    expect(document.querySelector('.lucide-telegram')).toBeInTheDocument();
    // Icons are now actual lucide-react components (SVGs), verify links instead
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(3);
  });

  it('uses default URLs', () => {
    render(<PopoverInvite />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Icons are now actual lucide-react components (SVGs), find links by href
    const links = screen.getAllByRole('link');
    const mailLink = links.find((link) => link.getAttribute('href') === EMAIL_URL);
    const twitterLink = links.find((link) => link.getAttribute('href') === TWITTER_URL);
    const telegramLink = links.find((link) => link.getAttribute('href') === TELEGRAM_URL);

    expect(mailLink).toHaveAttribute('href', EMAIL_URL);
    expect(twitterLink).toHaveAttribute('href', TWITTER_URL);
    expect(telegramLink).toHaveAttribute('href', TELEGRAM_URL);
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
    expect(description).toBeInTheDocument();
  });
});

// Note: snapshot cannot capture entire popover content, so the above unit tests are more important
describe('PopoverInvite - Snapshots', () => {
  it('matches snapshot for default PopoverInvite', () => {
    const { container } = render(<PopoverInvite />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for PopoverInvite with custom className', () => {
    const { container } = render(<PopoverInvite className="custom-invite-style" />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });
});
