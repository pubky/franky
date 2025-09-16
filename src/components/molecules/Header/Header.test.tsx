/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  HeaderContainer,
  HeaderTitle,
  HeaderOnboarding,
  HeaderSocialLinks,
  HeaderButtonSignIn,
  HeaderHome,
  HeaderSignIn,
  HeaderNavigationButtons,
} from './Header';
import * as Config from '@/config';
import * as App from '@/app';

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
  HeaderSocialLinks: () => <div data-testid="social-links">Social Links</div>,
  HeaderButtonSignIn: () => <div data-testid="button-sign-in">Sign In Button</div>,
  SearchInput: () => <div data-testid="search-input">Search Input</div>,
  HeaderNavigationButtons: () => <div data-testid="navigation-buttons">Navigation Buttons</div>,
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
  });
});

describe('HeaderOnboarding', () => {
  it('renders progress steps with correct props', () => {
    render(<HeaderOnboarding currentStep={3} />);

    const progressSteps = screen.getByTestId('progress-steps');
    expect(progressSteps).toBeInTheDocument();
  });
});

describe('HeaderSocialLinks', () => {
  it('renders social media links', () => {
    render(<HeaderSocialLinks />);

    const links = screen.getAllByTestId('link');
    expect(links).toHaveLength(3);

    // Check GitHub link
    expect(links[0]).toHaveAttribute('href', Config.GITHUB_URL);

    // Check Twitter link
    expect(links[1]).toHaveAttribute('href', Config.TWITTER_GETPUBKY_URL);

    // Check Telegram link
    expect(links[2]).toHaveAttribute('href', Config.TELEGRAM_URL);
  });
});

describe('HeaderButtonSignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign in button', () => {
    render(<HeaderButtonSignIn />);

    const button = screen.getByTestId('button-secondary');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Sign in');
  });

  it('handles click event', () => {
    render(<HeaderButtonSignIn />);

    const button = screen.getByTestId('button-secondary');
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith(App.AUTH_ROUTES.SIGN_IN);
  });
});

describe('HomeHeader', () => {
  it('has correct navigation links', () => {
    render(<HeaderNavigationButtons />);

    const links = screen.getAllByTestId('link');

    expect(links[0]).toHaveAttribute('href', App.FEED_ROUTES.FEED);
    expect(links[1]).toHaveAttribute('href', '/search');
    expect(links[2]).toHaveAttribute('href', '/hot');
    expect(links[3]).toHaveAttribute('href', '/bookmarks');
    expect(links[4]).toHaveAttribute('href', '/settings');
    expect(links[5]).toHaveAttribute('href', '/profile');
  });

  it('renders exact counter when counter is 21 or less', () => {
    render(<HeaderNavigationButtons counter={21} />);

    const badge = screen.getByTestId('badge');
    expect(badge).toBeInTheDocument();
    expect(screen.getByTestId('typography')).toHaveTextContent('21');
  });

  it('does not render counter badge when counter is 0', () => {
    render(<HeaderNavigationButtons counter={0} />);

    expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
  });
});

describe('Header - Snapshots', () => {
  it('matches snapshot for HeaderContainer with default props', () => {
    const { container } = render(
      <HeaderContainer>
        <div>Header content</div>
      </HeaderContainer>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for HeaderTitle with different configurations', () => {
    const { container: defaultContainer } = render(<HeaderTitle>Default Title</HeaderTitle>);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customClassContainer } = render(
      <HeaderTitle className="custom-title">Custom Title</HeaderTitle>,
    );
    expect(customClassContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for HeaderSignIn', () => {
    const { container: defaultContainer } = render(<HeaderSignIn />);
    expect(defaultContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for OnboardingHeader with different configurations', () => {
    const { container: defaultContainer } = render(<OnboardingHeader currentStep={1} totalSteps={5} />);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customClassContainer } = render(
      <OnboardingHeader currentStep={3} totalSteps={5} className="custom-header" />,
    );
    expect(customClassContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for SocialLinks with different configurations', () => {
    const { container: defaultContainer } = render(<SocialLinks />);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customClassContainer } = render(<SocialLinks className="custom-social" />);
    expect(customClassContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for ButtonSignIn with different configurations', () => {
    const { container: defaultContainer } = render(<ButtonSignIn />);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customClassContainer } = render(<ButtonSignIn className="custom-signin" />);
    expect(customClassContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for HomeHeader with different configurations', () => {
    const { container: defaultContainer } = render(<HomeHeader />);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customClassContainer } = render(<HomeHeader className="custom-home-header" />);
    expect(customClassContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for NavigationButtons with different configurations', () => {
    const { container: defaultContainer } = render(<NavigationButtons />);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: withCounterContainer } = render(<NavigationButtons counter={5} />);
    expect(withCounterContainer.firstChild).toMatchSnapshot();

    // check counter badge is not shown when counter is 0
    const { container: withCounterContainerZero } = render(<NavigationButtons counter={0} />);
    expect(withCounterContainerZero.firstChild).toMatchSnapshot();

    // check counter is '21+' when counter is greater than 21
    const { container: withCounterContainerHigh } = render(
      <NavigationButtons counter={25} avatarImage="/avatar.jpg" />,
    );
    expect(withCounterContainerHigh.firstChild).toMatchSnapshot();

    const { container: withAvatarContainer } = render(<NavigationButtons avatarImage="/avatar.jpg" />);
    expect(withAvatarContainer.firstChild).toMatchSnapshot();

    const { container: withBothContainer } = render(<NavigationButtons counter={15} avatarImage="/avatar.jpg" />);
    expect(withBothContainer.firstChild).toMatchSnapshot();

    const { container: customClassContainer } = render(<NavigationButtons className="custom-nav" />);
    expect(customClassContainer.firstChild).toMatchSnapshot();
  });
});
