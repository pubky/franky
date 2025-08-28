import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logout } from './Logout';

// Mock the atoms and molecules
vi.mock('@/atoms', () => ({
  Container: ({ children, className, size }: { children: React.ReactNode; className?: string; size?: string }) => (
    <div className={className} data-size={size} role="generic">
      {children}
    </div>
  ),
}));

vi.mock('@/molecules', () => ({
  LogoutContent: () => <div data-testid="logout-content">Logout Content</div>,
  LogoutNavigation: () => <div data-testid="logout-navigation">Logout Navigation</div>,
}));

describe('Logout', () => {
  it('renders without errors', () => {
    render(<Logout />);
    expect(screen.getByTestId('logout-content')).toBeInTheDocument();
    expect(screen.getByTestId('logout-navigation')).toBeInTheDocument();
  });

  it('renders LogoutContent component', () => {
    render(<Logout />);
    const logoutContent = screen.getByTestId('logout-content');
    expect(logoutContent).toBeInTheDocument();
    expect(logoutContent).toHaveTextContent('Logout Content');
  });

  it('renders LogoutNavigation component', () => {
    render(<Logout />);
    const logoutNavigation = screen.getByTestId('logout-navigation');
    expect(logoutNavigation).toBeInTheDocument();
    expect(logoutNavigation).toHaveTextContent('Logout Navigation');
  });

  it('renders container with correct props', () => {
    render(<Logout />);
    const containers = screen.getAllByRole('generic');
    const mainContainer = containers.find(
      (container) => container.getAttribute('data-size') === 'container' && container.classList.contains('px-6'),
    );
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveAttribute('data-size', 'container');
    expect(mainContainer).toHaveClass('px-6');
  });

  it('contains both content and navigation sections', () => {
    render(<Logout />);
    expect(screen.getByTestId('logout-content')).toBeInTheDocument();
    expect(screen.getByTestId('logout-navigation')).toBeInTheDocument();
  });
});
