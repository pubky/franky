/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  HeaderContainer,
  HeaderTitle,
  OnboardingHeader,
  SocialLinks,
  ButtonSignIn,
  HomeHeader,
  NavigationButtons,
} from './Header';
import { GITHUB_URL, TWITTER_GETPUBKY_URL, TELEGRAM_URL } from '@/config';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({
    children,
    as = 'div',
    className,
    size,
  }: {
    children: React.ReactNode;
    as?: string;
    className?: string;
    size?: string;
  }) =>
    React.createElement(
      as,
      {
        'data-testid': 'container',
        className,
        'data-size': size,
      },
      children,
    ),
  Heading: ({
    children,
    level,
    size,
    className,
  }: {
    children: React.ReactNode;
    level: number;
    size?: string;
    className?: string;
  }) => (
    <div data-testid={`heading-${level}`} data-size={size} className={className}>
      {children}
    </div>
  ),
  Link: ({
    children,
    href,
    variant,
    size,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    variant?: string;
    size?: string;
    className?: string;
  }) => (
    <a data-testid="link" href={href} data-variant={variant} data-size={size} className={className}>
      {children}
    </a>
  ),
  Button: ({
    children,
    variant,
    onClick,
    className,
    size,
    ...props
  }: {
    children: React.ReactNode;
    variant?: string;
    onClick?: () => void;
    className?: string;
    size?: string;
    [key: string]: unknown;
  }) => (
    <button
      data-testid={variant ? `button-${variant}` : 'button'}
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src }: { src?: string }) => <img data-testid="avatar-image" src={src} alt="avatar" />,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <div data-testid="avatar-fallback">{children}</div>,
  Badge: ({ children, className, variant }: { children: React.ReactNode; className?: string; variant?: string }) => (
    <div data-testid="badge" className={className} data-variant={variant}>
      {children}
    </div>
  ),
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <div data-testid="typography" data-size={size} className={className}>
      {children}
    </div>
  ),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  ProgressSteps: ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
    <div data-testid="progress-steps" data-current={currentStep} data-total={totalSteps}>
      Progress {currentStep}/{totalSteps}
    </div>
  ),
  SocialLinks: () => <div data-testid="social-links">Social Links</div>,
  ButtonSignIn: () => <div data-testid="button-sign-in">Sign In Button</div>,
}));

// Mock libs
vi.mock('@/libs', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  Github2: ({ className }: { className?: string }) => (
    <div data-testid="github-icon" className={className}>
      Github
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
  LogIn: ({ className }: { className?: string }) => (
    <div data-testid="login-icon" className={className}>
      LogIn
    </div>
  ),
  Home: ({ className }: { className?: string }) => (
    <div data-testid="home-icon" className={className}>
      Home
    </div>
  ),
  Search: ({ className }: { className?: string }) => (
    <div data-testid="search-icon" className={className}>
      Search
    </div>
  ),
  Flame: ({ className }: { className?: string }) => (
    <div data-testid="flame-icon" className={className}>
      Flame
    </div>
  ),
  Bookmark: ({ className }: { className?: string }) => (
    <div data-testid="bookmark-icon" className={className}>
      Bookmark
    </div>
  ),
  Settings: ({ className }: { className?: string }) => (
    <div data-testid="settings-icon" className={className}>
      Settings
    </div>
  ),
}));

describe('HeaderContainer', () => {
  it('renders with children', () => {
    render(
      <HeaderContainer>
        <div data-testid="child">Test Child</div>
      </HeaderContainer>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getAllByTestId('container')).toHaveLength(2);
  });

  it('renders as header element', () => {
    const { container } = render(
      <HeaderContainer>
        <div>Content</div>
      </HeaderContainer>,
    );

    expect(container.querySelector('header')).toBeInTheDocument();
  });
});

describe('HeaderTitle', () => {
  it('renders with current title', () => {
    render(<HeaderTitle currentTitle="Test Title" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByTestId('heading-2')).toBeInTheDocument();
  });

  it('applies correct heading level and size', () => {
    render(<HeaderTitle currentTitle="Test" />);

    const heading = screen.getByTestId('heading-2');
    expect(heading).toHaveAttribute('data-size', 'lg');
  });
});

describe('OnboardingHeader', () => {
  it('renders progress steps with correct props', () => {
    render(<OnboardingHeader currentStep={3} />);

    const progressSteps = screen.getByTestId('progress-steps');
    expect(progressSteps).toBeInTheDocument();
    expect(progressSteps).toHaveAttribute('data-current', '3');
    expect(progressSteps).toHaveAttribute('data-total', '5');
  });
});

describe('SocialLinks', () => {
  it('renders social media links', () => {
    render(<SocialLinks />);

    const links = screen.getAllByTestId('link');
    expect(links).toHaveLength(3);

    // Check GitHub link
    expect(links[0]).toHaveAttribute('href', GITHUB_URL);

    // Check Twitter link
    expect(links[1]).toHaveAttribute('href', TWITTER_GETPUBKY_URL);

    // Check Telegram link
    expect(links[2]).toHaveAttribute('href', TELEGRAM_URL);
  });

  it('applies custom className', () => {
    render(<SocialLinks className="custom-class" />);

    const container = screen.getByTestId('container');
    expect(container.className).toContain('custom-class');
  });

  it('has correct default styling', () => {
    render(<SocialLinks />);

    const container = screen.getByTestId('container');
    expect(container.className).toContain('hidden md:flex flex-row justify-end gap-6 mr-6');
  });
});

describe('ButtonSignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign in button', () => {
    render(<ButtonSignIn />);

    const button = screen.getByTestId('button-secondary');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Sign in');
  });

  it('handles click event', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<ButtonSignIn />);

    const button = screen.getByTestId('button-secondary');
    fireEvent.click(button);

    expect(consoleSpy).toHaveBeenCalledWith('sign in');

    consoleSpy.mockRestore();
  });

  it('has correct variant', () => {
    render(<ButtonSignIn />);

    const button = screen.getByTestId('button-secondary');
    expect(button).toHaveAttribute('data-variant', 'secondary');
  });

  it('passes through additional props', () => {
    render(<ButtonSignIn id="custom-id" />);

    const button = screen.getByTestId('button-secondary');
    expect(button).toHaveAttribute('id', 'custom-id');
  });
});

describe('HomeHeader', () => {
  it('renders social links and sign in button', () => {
    render(<HomeHeader />);

    expect(screen.getByTestId('social-links')).toBeInTheDocument();
    expect(screen.getByTestId('button-sign-in')).toBeInTheDocument();
  });

  it('has correct container structure', () => {
    render(<HomeHeader />);

    const container = screen.getByTestId('container');
    expect(container.className).toContain('flex-1 flex-row items-center justify-end');
  });
});

describe('NavigationButtons', () => {
  it('renders all navigation buttons', () => {
    render(<NavigationButtons />);

    expect(screen.getAllByTestId('button-secondary')).toHaveLength(5);
    expect(screen.getAllByTestId('link')).toHaveLength(6);
  });

  it('renders with avatar when image is provided', () => {
    render(<NavigationButtons image="/test-image.jpg" />);

    const avatarImage = screen.getByTestId('avatar-image');
    expect(avatarImage).toHaveAttribute('src', '/test-image.jpg');
  });

  it('renders avatar fallback when no image', () => {
    render(<NavigationButtons />);

    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('SN');
  });

  it('renders counter badge when provided', () => {
    render(<NavigationButtons counter={5} />);

    const badge = screen.getByTestId('badge');
    expect(badge).toBeInTheDocument();
    expect(screen.getByTestId('typography')).toHaveTextContent('5');
  });

  it('does not render counter badge when not provided', () => {
    render(<NavigationButtons />);

    expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
  });

  it('has correct navigation links', () => {
    render(<NavigationButtons />);

    const links = screen.getAllByTestId('link');

    expect(links[0]).toHaveAttribute('href', '/feed');
    expect(links[1]).toHaveAttribute('href', '/search');
    expect(links[2]).toHaveAttribute('href', '/hot');
    expect(links[3]).toHaveAttribute('href', '/bookmarks');
    expect(links[4]).toHaveAttribute('href', '/settings');
    expect(links[5]).toHaveAttribute('href', '/profile');
  });

  it('renders counter badge with 21+ when counter exceeds 21', () => {
    render(<NavigationButtons counter={25} />);

    const badge = screen.getByTestId('badge');
    expect(badge).toBeInTheDocument();
    expect(screen.getByTestId('typography')).toHaveTextContent('21+');
  });

  it('renders exact counter when counter is 21 or less', () => {
    render(<NavigationButtons counter={21} />);

    const badge = screen.getByTestId('badge');
    expect(badge).toBeInTheDocument();
    expect(screen.getByTestId('typography')).toHaveTextContent('21');
  });

  it('does not render counter badge when counter is 0', () => {
    render(<NavigationButtons counter={0} />);

    expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
  });

  it('applies small screen hidden class to search link', () => {
    render(<NavigationButtons />);

    const links = screen.getAllByTestId('link');
    const searchLink = links[1]; // Second link is the search link

    expect(searchLink.className).toContain('sm:hidden');
  });

  it('applies correct styling classes to counter badge', () => {
    render(<NavigationButtons counter={5} />);

    const badge = screen.getByTestId('badge');
    expect(badge.className).toContain('absolute bottom-0 right-0 rounded-full bg-brand h-5 w-5');
    expect(badge).toHaveAttribute('data-variant', 'secondary');
  });

  it('applies smaller text when counter exceeds 21', () => {
    render(<NavigationButtons counter={25} />);

    const typography = screen.getByTestId('typography');
    expect(typography.className).toContain('text-xs');
  });

  it('does not apply smaller text when counter is 21 or less', () => {
    render(<NavigationButtons counter={15} />);

    const typography = screen.getByTestId('typography');
    expect(typography.className).not.toContain('text-xs');
  });
});
