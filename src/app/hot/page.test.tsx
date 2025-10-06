import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HotPage from './page';

// Mock the Templates module
vi.mock('@/templates', () => ({
  Hot: vi.fn(() => <div data-testid="hot-template">Hot Template</div>),
}));

describe('HotPage', () => {
  it('renders without errors', () => {
    render(<HotPage />);
    expect(screen.getByTestId('hot-template')).toBeInTheDocument();
  });

  it('renders Hot template component', () => {
    render(<HotPage />);
    const hotTemplate = screen.getByTestId('hot-template');
    expect(hotTemplate).toBeInTheDocument();
    expect(hotTemplate).toHaveTextContent('Hot Template');
  });
});
