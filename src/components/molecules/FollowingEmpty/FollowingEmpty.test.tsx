import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FollowingEmpty } from './FollowingEmpty';

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Typography: ({ children, as, className }: { children: React.ReactNode; as?: string; className?: string }) => {
    const Tag = as || 'p';
    return (
      <Tag data-testid="typography" className={className}>
        {children}
      </Tag>
    );
  },
  Button: ({ children, className, variant }: { children: React.ReactNode; className?: string; variant?: string }) => (
    <button data-testid="button" className={className} data-variant={variant}>
      {children}
    </button>
  ),
  ButtonVariant: {
    DEFAULT: 'default',
    DESTRUCTIVE: 'destructive',
    OUTLINE: 'outline',
    SECONDARY: 'secondary',
    GHOST: 'ghost',
    BRAND: 'brand',
    LINK: 'link',
  },
}));

describe('FollowingEmpty', () => {
  it('renders title', () => {
    render(<FollowingEmpty />);
    expect(screen.getByText(/You are the algorithm/i)).toBeInTheDocument();
  });
});

describe('FollowingEmpty - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<FollowingEmpty />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
