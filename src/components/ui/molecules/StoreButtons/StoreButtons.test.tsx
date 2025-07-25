import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreButtons } from './StoreButtons';

// Mock the DialogDownloadPubkyRing component
vi.mock('@/components/ui', () => ({
  DialogDownloadPubkyRing: ({ store }: { store: string }) => (
    <button data-testid={`download-${store}`}>Download for {store}</button>
  ),
}));

describe('StoreButtons', () => {
  it('renders with default props', () => {
    render(<StoreButtons />);

    const appleButton = screen.getByTestId('download-apple');
    const androidButton = screen.getByTestId('download-android');

    expect(appleButton).toBeInTheDocument();
    expect(androidButton).toBeInTheDocument();
  });

  it('renders both store download buttons', () => {
    render(<StoreButtons />);

    expect(screen.getByText('Download for apple')).toBeInTheDocument();
    expect(screen.getByText('Download for android')).toBeInTheDocument();
  });

  it('applies default className', () => {
    const { container } = render(<StoreButtons />);

    const buttonsContainer = container.firstChild as HTMLElement;
    expect(buttonsContainer).toHaveClass('flex', 'gap-4', 'justify-around', 'sm:justify-start');
  });

  it('applies custom className', () => {
    const { container } = render(<StoreButtons className="custom-class" />);

    const buttonsContainer = container.firstChild as HTMLElement;
    expect(buttonsContainer).toHaveClass('custom-class');
  });

  it('maintains proper structure', () => {
    const { container } = render(<StoreButtons />);

    const buttonsContainer = container.firstChild as HTMLElement;
    expect(buttonsContainer.children).toHaveLength(2);
  });
});
