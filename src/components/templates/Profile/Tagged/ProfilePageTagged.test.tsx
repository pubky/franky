import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageTagged } from './ProfilePageTagged';

// Mock ProfileTagged organism
vi.mock('@/organisms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/organisms')>();
  return {
    ...actual,
    ProfileTagged: () => <div data-testid="profile-tagged">ProfileTagged Organism</div>,
  };
});

describe('ProfilePageTagged', () => {
  it('renders without errors', () => {
    const { container } = render(<ProfilePageTagged />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders ProfileTagged organism', () => {
    render(<ProfilePageTagged />);
    expect(screen.getByTestId('profile-tagged')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePageTagged />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
