import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BookmarksPage from './page';

// Mock the Templates module
vi.mock('@/templates', () => ({
  Bookmarks: vi.fn(() => <div data-testid="bookmarks-template">Bookmarks Template</div>),
}));

describe('BookmarksPage', () => {
  it('renders without errors', () => {
    render(<BookmarksPage />);
    expect(screen.getByTestId('bookmarks-template')).toBeInTheDocument();
  });

  it('renders Bookmarks template component', () => {
    render(<BookmarksPage />);
    const bookmarksTemplate = screen.getByTestId('bookmarks-template');
    expect(bookmarksTemplate).toBeInTheDocument();
    expect(bookmarksTemplate).toHaveTextContent('Bookmarks Template');
  });
});
