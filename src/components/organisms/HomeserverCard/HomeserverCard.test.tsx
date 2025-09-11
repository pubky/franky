import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HomeserverCard } from './HomeserverCard';
import { ImageProps } from 'next/image';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock core
vi.mock('@/core', () => ({
  useOnboardingStore: () => ({
    secretKey: 'mock-secret-key',
    publicKey: 'mock-public-key',
  }),
  AuthController: {
    generateSignupToken: vi.fn(() => Promise.resolve('mock-token')),
    signUp: vi.fn(() => Promise.resolve()),
  },
}));

// Mock libs
vi.mock('@/libs', () => ({
  Logger: {
    info: vi.fn(),
  },
  cn: (...inputs: (string | undefined | null | false)[]) => inputs.filter(Boolean).join(' '),
  Server: ({ className }: { className?: string }) => (
    <div data-testid="server-icon" className={className}>
      Server
    </div>
  ),
  ArrowLeft: ({ className }: { className?: string }) => (
    <div data-testid="arrow-left-icon" className={className}>
      ArrowLeft
    </div>
  ),
  ArrowRight: ({ className }: { className?: string }) => (
    <div data-testid="arrow-right-icon" className={className}>
      ArrowRight
    </div>
  ),
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="loader2-icon" className={className}>
      Loader2
    </div>
  ),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  useToast: () => ({
    toast: vi.fn(() => ({
      dismiss: vi.fn(),
    })),
  }),
  ContentCard: ({ children, image }: { children: React.ReactNode; image?: ImageProps }) => (
    <div data-testid="content-card" data-image={JSON.stringify(image)}>
      {children}
    </div>
  ),
  PopoverInviteHomeserver: () => <div data-testid="popover-invite-homeserver">Popover</div>,
  HomeserverFooter: () => <div data-testid="homeserver-footer">Footer</div>,
  InputField: ({
    value,
    variant,
    onChange,
    placeholder,
    maxLength,
    disabled,
    status,
    className,
    onClick,
  }: {
    value?: string;
    variant?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    maxLength?: number;
    disabled?: boolean;
    status?: string;
    className?: string;
    onClick?: () => void;
  }) => (
    <div data-testid="input-field" className={className}>
      <input
        data-testid="input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        data-variant={variant}
        data-status={status}
        onClick={onClick}
      />
    </div>
  ),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Heading: ({
    children,
    level,
    size,
    className,
  }: {
    children: React.ReactNode;
    level?: number;
    size?: string;
    className?: string;
  }) => {
    const Tag = `h${level || 1}` as keyof JSX.IntrinsicElements;
    return (
      <Tag data-testid={`heading-${level || 1}`} data-size={size} className={className}>
        {children}
      </Tag>
    );
  },
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <p data-testid="typography" data-size={size} className={className}>
      {children}
    </p>
  ),
  Button: ({
    children,
    variant,
    size,
    className,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button
      data-testid={`button-${variant || 'default'}`}
      data-size={size}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

describe('HomeserverCard - Snapshots', () => {
  it('matches snapshot for default HomeserverCard', () => {
    const { container } = render(<HomeserverCard />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
