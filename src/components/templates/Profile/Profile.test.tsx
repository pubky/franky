import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Profile } from './Profile';

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <div data-testid="container" data-size={size} className={className}>
      {children}
    </div>
  ),
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  CreateProfileHeader: () => <div data-testid="create-profile-header">Create Profile Header</div>,
  CreateProfileForm: () => <div data-testid="create-profile-form">Create Profile Form</div>,
}));

describe('Profile - Snapshots', () => {
  it('matches snapshot for default Profile', () => {
    const { container } = render(<Profile />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
