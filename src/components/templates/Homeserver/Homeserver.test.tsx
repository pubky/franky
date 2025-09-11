import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Homeserver } from './Homeserver';

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <div data-testid="container" data-size={size} className={className}>
      {children}
    </div>
  ),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  HomeserverHeader: () => <div data-testid="homeserver-header">Homeserver Header</div>,
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  HomeserverCard: () => <div data-testid="homeserver-card">Homeserver Card</div>,
}));

describe('Homeserver - Snapshots', () => {
  it('matches snapshot for default Homeserver', () => {
    const { container } = render(<Homeserver />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
