import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('renders with default props', () => {
    render(<HeroSection />);

    const heading = screen.getByRole('heading', { level: 1 });
    const subtitle = screen.getByText('Pubky requires an invite code');
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    const createAccountButton = screen.getByRole('button', { name: /create account/i });
    const footer = screen.getByText(/by creating a pubky account/i);

    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Unlockthe web.');
    expect(subtitle).toBeInTheDocument();
    expect(signInButton).toBeInTheDocument();
    expect(createAccountButton).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });

  it('renders with custom title and subtitle', () => {
    render(<HeroSection title="Custom Title\nSecond Line" subtitle="Custom subtitle text" />);

    const heading = screen.getByRole('heading', { level: 1 });
    const subtitle = screen.getByText('Custom subtitle text');

    expect(heading).toHaveTextContent('Custom Title');
    expect(heading).toHaveTextContent('Second Line');
    expect(subtitle).toBeInTheDocument();
  });

  it('handles title with line breaks correctly', () => {
    render(<HeroSection title="Line One\nLine Two\nLine Three" />);

    const heading = screen.getByRole('heading', { level: 1 });

    // Check that the text content includes all lines
    expect(heading).toHaveTextContent('Line One');
    expect(heading).toHaveTextContent('Line Two');
    expect(heading).toHaveTextContent('Line Three');

    // Check that the heading renders properly with the title content
    expect(heading).toBeInTheDocument();
  });

  it('calls onSignIn when sign in button is clicked', () => {
    const mockOnSignIn = vi.fn();
    render(<HeroSection onSignIn={mockOnSignIn} />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    expect(mockOnSignIn).toHaveBeenCalledTimes(1);
  });

  it('calls onCreateAccount when create account button is clicked', () => {
    const mockOnCreateAccount = vi.fn();
    render(<HeroSection onCreateAccount={mockOnCreateAccount} />);

    const createAccountButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(createAccountButton);

    expect(mockOnCreateAccount).toHaveBeenCalledTimes(1);
  });

  it('shows invite popover by default', () => {
    render(<HeroSection />);

    // Look for all buttons
    const buttons = screen.getAllByRole('button');

    // Should have 3 buttons: gift button + sign in + create account
    expect(buttons).toHaveLength(3);
  });

  it('hides invite popover when showInvitePopover is false', () => {
    render(<HeroSection showInvitePopover={false} />);

    const buttons = screen.getAllByRole('button');

    // Should only have 2 buttons: sign in + create account (no gift button)
    expect(buttons).toHaveLength(2);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<HeroSection className="custom-hero-class" />);

    const container = screen.getByRole('heading').closest('div')?.parentElement;
    expect(container).toHaveClass('custom-hero-class');
  });

  it('has proper container structure', () => {
    render(<HeroSection />);

    const heading = screen.getByRole('heading');
    const contentContainer = heading.parentElement;
    const mainContainer = contentContainer?.parentElement;

    expect(mainContainer).toHaveClass('container', 'mx-auto', 'px-6', 'lg:px-10', 'pt-24', 'lg:pt-36');
    expect(contentContainer).toHaveClass('flex', 'flex-col', 'gap-6', 'max-w-[588px]');
  });

  it('renders subtitle with proper styling', () => {
    render(<HeroSection />);

    const subtitle = screen.getByText('Pubky requires an invite code');
    expect(subtitle).toHaveClass('text-xl', 'lg:text-2xl', 'font-light', 'text-brand');
  });

  it('renders footer with legal text and brand links', () => {
    render(<HeroSection />);

    const footer = screen.getByText(/by creating a pubky account/i);
    const termsSpan = screen.getByText('Terms of Service');
    const privacySpan = screen.getByText('Privacy Policy');
    const ageSpan = screen.getByText('over 18 years old.');
    const pubkyCoreSpan = screen.getByText('Pubky Core');

    expect(footer).toHaveClass('text-sm', 'text-muted-foreground', 'opacity-80');
    expect(termsSpan).toHaveClass('text-brand');
    expect(privacySpan).toHaveClass('text-brand');
    expect(ageSpan).toHaveClass('text-brand');
    expect(pubkyCoreSpan).toHaveClass('text-brand');
  });

  it('handles both callback functions simultaneously', () => {
    const mockOnSignIn = vi.fn();
    const mockOnCreateAccount = vi.fn();

    render(<HeroSection onSignIn={mockOnSignIn} onCreateAccount={mockOnCreateAccount} />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    const createAccountButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.click(signInButton);
    fireEvent.click(createAccountButton);

    expect(mockOnSignIn).toHaveBeenCalledTimes(1);
    expect(mockOnCreateAccount).toHaveBeenCalledTimes(1);
  });
});
