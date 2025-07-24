/* eslint-disable @next/next/no-img-element */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }) => <img src={src} alt={alt} width={width} height={height} className={className} data-testid="logo-image" />,
}));

describe('Logo', () => {
  it('renders with default props', () => {
    render(<Logo />);

    const container = screen.getByTestId('logo-image').parentElement;
    const image = screen.getByTestId('logo-image');

    expect(container).toHaveClass('h-9', 'flex', 'items-center');
    expect(image).toHaveAttribute('src', '/pubky-logo.svg');
    expect(image).toHaveAttribute('alt', 'Pubky');
    expect(image).toHaveAttribute('width', '78');
    expect(image).toHaveAttribute('height', '24');
    expect(image).toHaveClass('w-auto', 'h-auto');
  });

  it('renders with custom dimensions', () => {
    render(<Logo width={100} height={50} />);

    const image = screen.getByTestId('logo-image');
    expect(image).toHaveAttribute('width', '100');
    expect(image).toHaveAttribute('height', '50');
  });

  it('renders with custom className', () => {
    render(<Logo className="custom-logo-class" />);

    const image = screen.getByTestId('logo-image');
    expect(image).toHaveClass('custom-logo-class');
  });

  it('has proper accessibility attributes', () => {
    render(<Logo />);

    const image = screen.getByAltText('Pubky');
    expect(image).toBeInTheDocument();
  });
});
