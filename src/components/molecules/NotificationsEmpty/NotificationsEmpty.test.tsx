import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationsEmpty } from './NotificationsEmpty';

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
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Frown: ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
    <svg data-testid="frown-icon" className={className} data-stroke-width={strokeWidth}>
      Frown
    </svg>
  ),
}));

describe('NotificationsEmpty', () => {
  it('renders title', () => {
    render(<NotificationsEmpty />);
    expect(screen.getByText(/Nothing to see here yet/i)).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<NotificationsEmpty />);
    expect(
      screen.getByText(/Tags, follows, reposts and account information will be displayed here/i),
    ).toBeInTheDocument();
  });

  it('renders Frown icon', () => {
    render(<NotificationsEmpty />);
    expect(screen.getByTestId('frown-icon')).toBeInTheDocument();
  });

  it('renders background images', () => {
    const { container } = render(<NotificationsEmpty />);
    const images = container.querySelectorAll('img');
    expect(images.length).toBe(2);
  });
});

describe('NotificationsEmpty - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<NotificationsEmpty />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
