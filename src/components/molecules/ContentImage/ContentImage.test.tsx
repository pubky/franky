import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentImage } from './ContentImage';

describe('ContentImage', () => {
  it('renders with default props', () => {
    render(<ContentImage src="/test-image.jpg" alt="Test image" width={400} height={300} />);

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Test image');
    const src = image.getAttribute('src');
    expect(src).toMatch(/test-image\.jpg/);
  });

  it('applies custom className', () => {
    render(<ContentImage src="/test.jpg" alt="Test" width={200} height={150} className="custom-class" />);

    const image = screen.getByRole('img');
    expect(image).toHaveClass('custom-class');
  });

  it('passes through additional props', () => {
    render(<ContentImage src="/test.jpg" alt="Test" width={200} height={150} data-testid="custom-image" />);

    const image = screen.getByTestId('custom-image');
    expect(image).toBeInTheDocument();
  });

  it('renders with different image sources', () => {
    const { rerender } = render(<ContentImage src="/image1.jpg" alt="Image 1" width={200} height={150} />);

    let image = screen.getByRole('img');
    expect(image.getAttribute('src')).toMatch(/image1\.jpg/);

    rerender(<ContentImage src="/image2.png" alt="Image 2" width={200} height={150} />);
    image = screen.getByRole('img');
    expect(image.getAttribute('src')).toMatch(/image2\.png/);
    expect(image).toHaveAttribute('alt', 'Image 2');
  });
});
