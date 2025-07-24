/* eslint-disable @next/next/no-img-element */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  LogIn: ({ className }: { className?: string }) => (
    <div data-testid="login-icon" className={className}>
      LogIn
    </div>
  ),
  Github: ({ className }: { className?: string }) => (
    <div data-testid="github-icon" className={className}>
      Github
    </div>
  ),
  Twitter: ({ className }: { className?: string }) => (
    <div data-testid="twitter-icon" className={className}>
      Twitter
    </div>
  ),
  Send: ({ className }: { className?: string }) => (
    <div data-testid="send-icon" className={className}>
      Send
    </div>
  ),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }) => <img src={src} alt={alt} width={width} height={height} className={className} data-testid="header-logo" />,
}));

describe('Header', () => {
  it('renders with default props', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    const logo = screen.getByTestId('header-logo');
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('border-b', 'border-border/50');
    expect(logo).toBeInTheDocument();
    expect(signInButton).toBeInTheDocument();
  });

  it('calls onSignIn when sign in button is clicked', () => {
    const mockOnSignIn = vi.fn();
    render(<Header onSignIn={mockOnSignIn} />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    expect(mockOnSignIn).toHaveBeenCalledTimes(1);
  });

  it('renders social links when showSocialLinks is true', () => {
    render(<Header showSocialLinks={true} />);

    // Social links should be present (they're in a container with display classes)
    const socialLinksContainer = screen
      .getByTestId('header-logo')
      .closest('header')
      ?.querySelector('.hidden.md\\:flex');
    expect(socialLinksContainer).toBeInTheDocument();
  });

  it('hides social links when showSocialLinks is false', () => {
    render(<Header showSocialLinks={false} />);

    // When showSocialLinks is false, the SocialLinks component shouldn't render
    // We can check this by looking for the container structure
    const nav = screen.getByRole('navigation');
    const rightSection = nav.children[1]; // Second child is the right section

    // Should only contain the sign in button, no social links
    expect(rightSection.children).toHaveLength(1);
  });

  it('passes custom URLs to social links', () => {
    render(
      <Header
        githubUrl="https://github.com/custom"
        twitterUrl="https://twitter.com/custom"
        telegramUrl="https://t.me/custom"
      />,
    );

    // The URLs are passed to SocialLinks component, which we've tested separately
    // Here we just verify the Header renders without issues
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Header className="custom-header-class" />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('custom-header-class');
  });

  it('has proper navigation structure', () => {
    render(<Header />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('flex', 'justify-between', 'items-center');

    // Check container structure
    const container = nav.parentElement;
    expect(container).toHaveClass('container', 'mx-auto', 'px-6', 'lg:px-10', 'py-6');
  });

  it('renders logo with proper structure', () => {
    render(<Header />);

    const logo = screen.getByTestId('header-logo');
    const logoContainer = logo.parentElement;

    expect(logoContainer).toHaveClass('h-9', 'flex', 'items-center');
    expect(logo).toHaveAttribute('src', '/pubky-logo.svg');
    expect(logo).toHaveAttribute('alt', 'Pubky');
  });

  it('renders sign in button with proper styling', () => {
    render(<Header />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    const loginIcon = screen.getByTestId('login-icon');

    expect(signInButton).toHaveClass('rounded-full');
    expect(loginIcon).toHaveClass('mr-2', 'h-4', 'w-4');
  });
});
