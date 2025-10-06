import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './page';

// Mock the Templates module
vi.mock('@/templates', () => ({
  Home: vi.fn(() => <div data-testid="home-template">Home Template</div>),
}));

describe('HomePage', () => {
  it('renders without errors', () => {
    render(<HomePage />);
    expect(screen.getByTestId('home-template')).toBeInTheDocument();
  });

  it('renders Home template component', () => {
    render(<HomePage />);
    const homeTemplate = screen.getByTestId('home-template');
    expect(homeTemplate).toBeInTheDocument();
    expect(homeTemplate).toHaveTextContent('Home Template');
  });
});
