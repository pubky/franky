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

    expect(container).toHaveClass('flex', 'items-center', 'min-w-[109px]', 'min-h-[36px]');
    expect(image).toHaveAttribute('src', '/pubky-logo.svg');
    expect(image).toHaveAttribute('alt', 'Pubky');
    expect(image).toHaveAttribute('width', '109');
    expect(image).toHaveAttribute('height', '36');
    expect(image).toHaveClass('w-[109px]', 'h-[36px]');
  });

  it('renders with custom dimensions', () => {
    render(<Logo width={100} height={50} />);

    const image = screen.getByTestId('logo-image');
    expect(image).toHaveAttribute('width', '100');
    expect(image).toHaveAttribute('height', '50');
  });

  it('renders with custom className', () => {
    render(<Logo className="custom-logo-class" />);

    const container = screen.getByTestId('logo-image').parentElement;
    expect(container).toHaveClass('custom-logo-class');
  });

  it('has proper accessibility attributes', () => {
    render(<Logo />);

    const image = screen.getByAltText('Pubky');
    expect(image).toBeInTheDocument();
  });
});

describe('Logo - Snapshots', () => {
  it('matches snapshot for default Logo', () => {
    const { container } = render(<Logo />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for Logo with custom dimensions', () => {
    const { container } = render(<Logo width={200} height={80} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for Logo with custom className', () => {
    const { container } = render(<Logo className="custom-logo-style" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
