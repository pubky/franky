import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfilePage from './page';

// Mock the Templates module
vi.mock('@/templates', () => ({
  ProfilePage: vi.fn(() => <div data-testid="profile-template">Profile Template</div>),
}));

describe('ProfilePage', () => {
  it('renders without errors', () => {
    render(<ProfilePage />);
    expect(screen.getByTestId('profile-template')).toBeInTheDocument();
  });

  it('renders ProfilePage template component', () => {
    render(<ProfilePage />);
    const profileTemplate = screen.getByTestId('profile-template');
    expect(profileTemplate).toBeInTheDocument();
    expect(profileTemplate).toHaveTextContent('Profile Template');
  });
});
