import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileNotFound } from './ProfileNotFound';

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    'data-cy': dataCy,
  }: {
    children: React.ReactNode;
    className?: string;
    'data-cy'?: string;
  }) => (
    <div data-testid="container" className={className} data-cy={dataCy}>
      {children}
    </div>
  ),
  Typography: ({
    children,
    as: Tag = 'p',
    className,
  }: {
    children: React.ReactNode;
    as?: React.ElementType;
    className?: string;
  }) => (
    <Tag data-testid="typography" className={className}>
      {children}
    </Tag>
  ),
  Button: ({ children, className, variant }: { children: React.ReactNode; className?: string; variant?: string }) => (
    <button data-testid="button" className={className} data-variant={variant}>
      {children}
    </button>
  ),
}));

describe('ProfileNotFound', () => {
  it('renders title', () => {
    render(<ProfileNotFound />);
    expect(screen.getByText(/User not found/i)).toBeInTheDocument();
  });

  it('renders subtitle with explanation', () => {
    render(<ProfileNotFound />);
    expect(screen.getByText(/The user you are looking for does not exist/i)).toBeInTheDocument();
  });

  it('renders go to home button', () => {
    render(<ProfileNotFound />);
    expect(screen.getByText(/Go to Home/i)).toBeInTheDocument();
  });

  it('has data-cy attribute for testing', () => {
    render(<ProfileNotFound />);
    expect(document.querySelector('[data-cy="profile-not-found"]')).toBeInTheDocument();
  });
});

describe('ProfileNotFound - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<ProfileNotFound />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
