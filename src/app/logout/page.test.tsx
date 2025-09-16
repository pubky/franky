import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LogoutPage from './page';

// Mock the Templates module
vi.mock('@/templates', () => ({
  Logout: vi.fn(() => <div data-testid="logout-template">Logout Template</div>),
}));

describe('LogoutPage', () => {
  it('renders without errors', () => {
    render(<LogoutPage />);
    expect(screen.getByTestId('logout-template')).toBeInTheDocument();
  });

  it('renders Logout template component', () => {
    render(<LogoutPage />);
    const logoutTemplate = screen.getByTestId('logout-template');
    expect(logoutTemplate).toBeInTheDocument();
    expect(logoutTemplate).toHaveTextContent('Logout Template');
  });
});
