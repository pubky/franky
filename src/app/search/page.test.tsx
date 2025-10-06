import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchPage from './page';

vi.mock('@/templates', () => ({
  Search: vi.fn(() => <div data-testid="search-template">Search Template</div>),
}));

describe('SearchPage', () => {
  it('renders without errors', () => {
    render(<SearchPage />);
    expect(screen.getByTestId('search-template')).toBeInTheDocument();
  });

  it('renders Search template component', () => {
    render(<SearchPage />);
    const searchTemplate = screen.getByTestId('search-template');
    expect(searchTemplate).toBeInTheDocument();
    expect(searchTemplate).toHaveTextContent('Search Template');
  });
});
