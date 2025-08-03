import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeaderContainer, HeaderTitle, OnboardingHeader, SocialLinks, ButtonSignIn, HomeHeader } from './Header';

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
  }: {
    children: React.ReactNode;
    href: string;
    variant?: string;
    size?: string;
  }) => (
    <a data-testid="link" href={href} data-variant={variant} data-size={size}>
      {children}
    </a>
  ),
  Button: ({
    children,
    variant,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    variant?: string;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button data-testid={variant ? `button-${variant}` : 'button'} onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
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
    expect(links[0]).toHaveAttribute('href', 'https://github.com/pubky');

    // Check Twitter link
    expect(links[1]).toHaveAttribute('href', 'https://twitter.com/getpubky');

    // Check Telegram link
    expect(links[2]).toHaveAttribute('href', 'https://t.me/pubky');
  });

  it('applies custom className', () => {
    render(<SocialLinks className="custom-class" />);

    const container = screen.getByTestId('container');
    expect(container.className).toContain('custom-class');
  });

  it('has correct default styling', () => {
    render(<SocialLinks />);

    const container = screen.getByTestId('container');
    expect(container.className).toContain('hidden md:flex flex-row justify-end gap-6 mr-8');
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
    render(<ButtonSignIn />);

    const button = screen.getByTestId('button-secondary');
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith('/onboarding/signin');
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
    expect(container.className).toContain('flex-1 flex-row items-center justify-end gap-6');
  });
});
