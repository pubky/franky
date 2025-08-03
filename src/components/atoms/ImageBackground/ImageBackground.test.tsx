import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageBackground } from './ImageBackground';

describe('ImageBackground', () => {
  it('renders with default props', () => {
    render(<ImageBackground image="/bg-image.jpg" data-testid="image-background" />);

    const background = screen.getByTestId('image-background');
    expect(background).toBeInTheDocument();
    expect(background).toHaveClass('fixed', 'inset-0', 'bg-cover', 'bg-center', 'bg-no-repeat', '-z-10');
    expect(background).toHaveStyle({ backgroundImage: 'url(/bg-image.jpg)' });
  });

  it('applies custom className', () => {
    render(<ImageBackground image="/bg.jpg" className="custom-bg" data-testid="image-background" />);

    const background = screen.getByTestId('image-background');
    expect(background).toHaveClass('custom-bg');
  });

  it('passes through additional props', () => {
    render(<ImageBackground image="/bg.jpg" id="background-id" data-testid="image-background" />);

    const background = screen.getByTestId('image-background');
    expect(background).toHaveAttribute('id', 'background-id');
  });

  it('renders with different background images', () => {
    const { rerender } = render(<ImageBackground image="/bg1.jpg" data-testid="image-background" />);

    let background = screen.getByTestId('image-background');
    expect(background).toHaveStyle({ backgroundImage: 'url(/bg1.jpg)' });

    rerender(<ImageBackground image="/bg2.png" data-testid="image-background" />);
    background = screen.getByTestId('image-background');
    expect(background).toHaveStyle({ backgroundImage: 'url(/bg2.png)' });
  });
});
