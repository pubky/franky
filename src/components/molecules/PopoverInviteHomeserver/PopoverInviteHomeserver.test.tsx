import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PopoverInviteHomeserver } from './PopoverInviteHomeserver';

// Mock libs
vi.mock('@/libs', () => ({
  CircleHelp: ({ className }: { className?: string }) => (
    <div data-testid="circle-help-icon" className={className}>
      CircleHelp
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

// Mock atoms
vi.mock('@/atoms', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="popover-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  PopoverContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="popover-content" className={className}>
      {children}
    </div>
  ),
  Button: ({
    children,
    variant,
    size,
    className,
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    className?: string;
  }) => (
    <button data-testid={`button-${variant || 'default'}`} data-size={size} className={className}>
      {children}
    </button>
  ),
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
  Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a data-testid="link" href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('PopoverInviteHomeserver - Snapshots', () => {
  it('matches snapshot for default PopoverInviteHomeserver', () => {
    const { container } = render(<PopoverInviteHomeserver />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for PopoverInviteHomeserver with custom className', () => {
    const { container } = render(<PopoverInviteHomeserver className="custom-homeserver-style" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
