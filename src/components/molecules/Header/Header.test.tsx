import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useRouter } from 'next/navigation';
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

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock the components
vi.mock('@/components', () => ({
  Button: ({
    children,
    onClick,
    className,
    variant,
    size,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: string;
    size?: string;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} className={className} data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  ),
  Link: ({
    children,
    href,
    target,
    variant,
    size,
    className,
    ...props
  }: {
    children: React.ReactNode;
    href?: string;
    target?: string;
    variant?: string;
    size?: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    <a href={href} target={target} className={className} data-variant={variant} data-size={size} {...props}>
      {children}
    </a>
  ),
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src }: { src?: string }) => <img data-testid="avatar-image" src={src} alt="User avatar" />,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <div data-testid="avatar-fallback">{children}</div>,
  Badge: ({ children, className, variant }: { children: React.ReactNode; className?: string; variant?: string }) => (
    <div className={className} data-variant={variant}>
      {children}
    </div>
  ),
  Typography: ({ children, className, size }: { children: React.ReactNode; className?: string; size?: string }) => (
    <span className={className} data-size={size}>
      {children}
    </span>
  ),
}));

// Mock the molecules
vi.mock('@/molecules', () => ({
  ProgressSteps: ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
    <div data-testid="progress-steps" data-current={currentStep} data-total={totalSteps}>
      Progress Steps
    </div>
  ),
  SearchInput: () => <div data-testid="search-input">Search Input</div>,
  HeaderSocialLinks: () => <div data-testid="header-social-links">Social Links</div>,
  HeaderButtonSignIn: () => <div data-testid="header-button-sign-in">Sign In Button</div>,
  HeaderNavigationButtons: () => <div data-testid="header-navigation-buttons">Navigation Buttons</div>,
}));

// Mock the libs
vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  Github2: ({ className }: { className?: string }) => (
    <div data-testid="github-icon" className={className}>
      Github
    </div>
  ),
  XTwitter: ({ className }: { className?: string }) => (
    <div data-testid="twitter-icon" className={className}>
      Twitter
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

// Mock the config
vi.mock('@/config', () => ({
  GITHUB_URL: 'https://github.com',
  TWITTER_GETPUBKY_URL: 'https://twitter.com/getpubky',
  TELEGRAM_URL: 'https://t.me/getpubky',
}));

// Mock the app routes
vi.mock('@/app', () => ({
  AUTH_ROUTES: {
    SIGN_IN: '/sign-in',
  },
  FEED_ROUTES: {
    FEED: '/feed',
  },
}));

describe('Header Components', () => {
  const mockPush = vi.fn();
  const mockRouter = {
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter as ReturnType<typeof useRouter>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('HeaderContainer', () => {
    it('renders with children', () => {
      render(
        <HeaderContainer>
          <div>Test Content</div>
        </HeaderContainer>,
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies correct classes', () => {
      render(
        <HeaderContainer>
          <div>Test Content</div>
        </HeaderContainer>,
      );

      const container = screen.getByText('Test Content').closest('header');
      expect(container).toHaveClass(
        'hidden',
        'lg:flex',
        'py-6',
        'items-center',
        'px-6',
        'sticky',
        'top-0',
        'z-10',
        'bg-gradient-to-b',
        'from-[var(--background)]',
        'to-[var(--transparent)]',
        'h-[96px]',
        'md:h-[144px]',
      );
    });
  });

  describe('HeaderTitle', () => {
    it('renders with title', () => {
      render(<HeaderTitle currentTitle="Test Title" />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('applies correct classes', () => {
      render(<HeaderTitle currentTitle="Test Title" />);

      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('text-muted-foreground', 'font-normal');
    });

    it('applies correct heading attributes', () => {
      render(<HeaderTitle currentTitle="Test Title" />);

      const title = screen.getByText('Test Title');
      expect(title).toHaveAttribute('data-level', '2');
      expect(title).toHaveAttribute('data-size', 'lg');
    });
  });

  describe('HeaderOnboarding', () => {
    it('renders with progress steps', () => {
      render(<HeaderOnboarding currentStep={3} />);

      const progressSteps = screen.getByTestId('progress-steps');
      expect(progressSteps).toHaveAttribute('data-current', '3');
      expect(progressSteps).toHaveAttribute('data-total', '5');
    });
  });

  describe('HeaderSocialLinks', () => {
    it('renders social links', () => {
      render(<HeaderSocialLinks />);

      expect(screen.getByTestId('github-icon')).toBeInTheDocument();
      expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
      expect(screen.getByTestId('telegram-icon')).toBeInTheDocument();
    });

    it('applies correct classes', () => {
      render(<HeaderSocialLinks />);

      const container = screen.getByTestId('github-icon').closest('div');
      expect(container).toHaveClass('hidden', 'md:flex', 'flex-row', 'justify-end', 'gap-6', 'mr-6');
    });

    it('renders links with correct hrefs', () => {
      render(<HeaderSocialLinks />);

      const githubLink = screen.getByTestId('github-icon').closest('a');
      const twitterLink = screen.getByTestId('twitter-icon').closest('a');
      const telegramLink = screen.getByTestId('telegram-icon').closest('a');

      expect(githubLink).toHaveAttribute('href', 'https://github.com');
      expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/getpubky');
      expect(telegramLink).toHaveAttribute('href', 'https://t.me/getpubky');
    });
  });

  describe('HeaderButtonSignIn', () => {
    it('renders sign in button', () => {
      render(<HeaderButtonSignIn />);

      const button = screen.getByText('Sign in');
      expect(button).toBeInTheDocument();
    });

    it('handles click events', () => {
      render(<HeaderButtonSignIn />);

      const button = screen.getByText('Sign in');
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith('/sign-in');
    });

    it('applies correct classes', () => {
      render(<HeaderButtonSignIn />);

      const button = screen.getByText('Sign in');
      expect(button).toHaveAttribute('data-variant', 'secondary');
    });

    it('renders with login icon', () => {
      render(<HeaderButtonSignIn />);

      expect(screen.getByTestId('login-icon')).toBeInTheDocument();
    });
  });

  describe('HeaderHome', () => {
    it('renders with social links and sign in button', () => {
      render(<HeaderHome />);

      expect(screen.getByTestId('header-social-links')).toBeInTheDocument();
      expect(screen.getByTestId('header-button-sign-in')).toBeInTheDocument();
    });

    it('applies correct classes', () => {
      render(<HeaderHome />);

      const container = screen.getByTestId('header-social-links').closest('div');
      expect(container).toHaveClass('flex-1', 'flex-row', 'items-center', 'justify-end');
    });
  });

  describe('HeaderSignIn', () => {
    it('renders with search input and navigation buttons', () => {
      render(<HeaderSignIn />);

      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('header-navigation-buttons')).toBeInTheDocument();
    });

    it('applies correct classes', () => {
      render(<HeaderSignIn />);

      const container = screen.getByTestId('search-input').closest('div');
      expect(container).toHaveClass('flex-1', 'flex-row', 'items-center', 'justify-end', 'gap-3');
    });
  });

  describe('HeaderNavigationButtons', () => {
    it('renders with default props', () => {
      render(<HeaderNavigationButtons />);

      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    it('renders with custom image and counter', () => {
      render(<HeaderNavigationButtons image="test.jpg" counter={5} />);

      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('w-12', 'h-12');

      const avatarImage = screen.getByTestId('avatar-image');
      expect(avatarImage).toHaveAttribute('src', 'test.jpg');
    });

    it('renders counter badge when counter > 0', () => {
      render(<HeaderNavigationButtons counter={5} />);

      const badge = screen.getByText('5');
      expect(badge).toBeInTheDocument();
    });

    it('renders 21+ when counter > 21', () => {
      render(<HeaderNavigationButtons counter={25} />);

      const badge = screen.getByText('21+');
      expect(badge).toBeInTheDocument();
    });

    it('does not render badge when counter is 0', () => {
      render(<HeaderNavigationButtons counter={0} />);

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('applies correct classes', () => {
      render(<HeaderNavigationButtons />);

      const container = screen.getByTestId('avatar').closest('div');
      expect(container).toHaveClass('flex', 'flex-row', 'w-auto', 'justify-start', 'items-center', 'gap-3');
    });

    it('renders navigation links', () => {
      render(<HeaderNavigationButtons />);

      const homeLink = screen.getByTestId('home-icon').closest('a');
      const searchLink = screen.getByTestId('search-icon').closest('a');
      const bookmarkLink = screen.getByTestId('bookmark-icon').closest('a');
      const settingsLink = screen.getByTestId('settings-icon').closest('a');
      const profileLink = screen.getByTestId('avatar').closest('a');

      expect(homeLink).toHaveAttribute('href', '/feed');
      expect(searchLink).toHaveAttribute('href', '/search');
      expect(bookmarkLink).toHaveAttribute('href', '/bookmarks');
      expect(settingsLink).toHaveAttribute('href', '/settings');
      expect(profileLink).toHaveAttribute('href', '/profile');
    });

    it('applies correct button classes', () => {
      render(<HeaderNavigationButtons />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('w-12', 'h-12');
      });
    });
  });
});

describe('Header Components - Snapshots', () => {
  const mockPush = vi.fn();
  const mockRouter = {
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter as ReturnType<typeof useRouter>);
  });

  it('matches snapshot for HeaderContainer', () => {
    const { container } = render(
      <HeaderContainer>
        <div>Test Content</div>
      </HeaderContainer>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for HeaderTitle', () => {
    const { container } = render(<HeaderTitle currentTitle="Test Title" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for HeaderOnboarding', () => {
    const { container } = render(<HeaderOnboarding currentStep={3} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for HeaderSocialLinks', () => {
    const { container } = render(<HeaderSocialLinks />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for HeaderButtonSignIn', () => {
    const { container } = render(<HeaderButtonSignIn />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for HeaderHome', () => {
    const { container } = render(<HeaderHome />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for HeaderSignIn', () => {
    const { container } = render(<HeaderSignIn />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for HeaderNavigationButtons', () => {
    const { container } = render(<HeaderNavigationButtons />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for HeaderNavigationButtons with counter', () => {
    const { container } = render(<HeaderNavigationButtons counter={5} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
