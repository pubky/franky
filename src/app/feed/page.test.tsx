import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeedPage from './page';

// Mock the Templates module
vi.mock('@/templates', () => ({
  Feed: vi.fn(() => <div data-testid="feed-template">Feed Template</div>),
}));

describe('FeedPage', () => {
  it('renders without errors', () => {
    render(<FeedPage />);
    expect(screen.getByTestId('feed-template')).toBeInTheDocument();
  });

  it('renders Feed template component', () => {
    render(<FeedPage />);
    const feedTemplate = screen.getByTestId('feed-template');
    expect(feedTemplate).toBeInTheDocument();
    expect(feedTemplate).toHaveTextContent('Feed Template');
  });
});
